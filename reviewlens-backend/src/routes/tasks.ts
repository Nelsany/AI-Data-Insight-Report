import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import { prisma } from "../prisma";
import {
  CreateTaskRequestSchema,
  ParseResponseSchema
} from "../schemas";
import { fallbackParse } from "../services/fallbackParse";
import {
  fromCNCategory,
  fromCNRatingFilter,
  toCNCategory,
  toCNPlatform,
  toCNRatingFilter,
  toCNStatus,
} from "../mappers";
import { taskQueue } from "../queue/queue";
import { parseImportedFile } from "../services/importer";

export async function registerTaskRoutes(app: FastifyInstance) {
  // list
  app.get("/api/tasks", async () => {
    const tasks = await prisma.task.findMany({
      orderBy: { updatedAt: "desc" },
      include: { logs: { orderBy: { at: "asc" } }, report: true },
    });

    return {
      tasks: tasks.map((t) => ({
        id: t.id,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        platform: toCNPlatform(t.platform),
        category: toCNCategory(t.category),
        keyword: t.keyword,
        prompt: t.prompt,
        config: {
          sampleSize: t.sampleSize,
          timeRangeMonths: t.timeRangeMonths,
          ratingFilter: toCNRatingFilter(t.ratingFilter),
          analysisFocus: t.analysisFocus,
        },
        status: toCNStatus(t.status),
        progress: t.progress,
        logs: t.logs.map((l) => ({ at: l.at.toISOString(), level: l.level as any, message: l.message })),
        stats:
          t.comments != null
            ? {
                products: t.products ?? 0,
                comments: t.comments ?? 0,
                ratingDist: {
                  good: t.ratingGood ?? 0,
                  neutral: t.ratingNeutral ?? 0,
                  bad: t.ratingBad ?? 0,
                },
              }
            : undefined,
        reportId: t.report?.id,
      })),
    };
  });

  // create
  app.post("/api/tasks", async (req, reply) => {
    const body = CreateTaskRequestSchema.safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: "参数不合法" });

    const prompt = body.data.prompt;

    // 首期：后端同样提供规则解析兜底。前端也会先 call /api/parse。
    const base = fallbackParse(prompt);
    const merged = ParseResponseSchema.parse({
      category: body.data.category ?? base.category,
      keyword: body.data.keyword ?? base.keyword,
      config: { ...base.config, ...(body.data.config ?? {}) },
    });

    const id = `t_${nanoid(10)}`;
    const now = new Date();

    const task = await prisma.task.create({
      data: {
        id,
        createdAt: now,
        platform: "TAOBAO",
        category: fromCNCategory(merged.category),
        keyword: merged.keyword,
        prompt,
        sampleSize: merged.config.sampleSize,
        timeRangeMonths: merged.config.timeRangeMonths,
        ratingFilter: fromCNRatingFilter(merged.config.ratingFilter),
        analysisFocus: merged.config.analysisFocus,
        status: "PENDING",
        progress: 0,
        logs: {
          create: [
            { id: `l_${nanoid(10)}`, at: now, level: "info", message: "任务已创建，请先导入评论数据。" },
          ],
        },
      },
      include: { logs: { orderBy: { at: "asc" } }, report: true },
    });

    return reply.send({
      task: {
        id: task.id,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        platform: "淘宝",
        category: merged.category,
        keyword: task.keyword,
        prompt: task.prompt,
        config: merged.config,
        status: "待执行",
        progress: 0,
        logs: task.logs.map((l) => ({ at: l.at.toISOString(), level: l.level as any, message: l.message })),
      },
    });
  });

  // get by id
  app.get("/api/tasks/:id", async (req, reply) => {
    const id = (req.params as any).id as string;
    const t = await prisma.task.findUnique({ where: { id }, include: { logs: { orderBy: { at: "asc" } }, report: true } });
    if (!t) return reply.code(404).send({ error: "任务不存在" });

    return {
      task: {
        id: t.id,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        platform: toCNPlatform(t.platform),
        category: toCNCategory(t.category),
        keyword: t.keyword,
        prompt: t.prompt,
        config: {
          sampleSize: t.sampleSize,
          timeRangeMonths: t.timeRangeMonths,
          ratingFilter: toCNRatingFilter(t.ratingFilter),
          analysisFocus: t.analysisFocus,
        },
        status: toCNStatus(t.status),
        progress: t.progress,
        logs: t.logs.map((l) => ({ at: l.at.toISOString(), level: l.level as any, message: l.message })),
        stats:
          t.comments != null
            ? {
                products: t.products ?? 0,
                comments: t.comments ?? 0,
                ratingDist: {
                  good: t.ratingGood ?? 0,
                  neutral: t.ratingNeutral ?? 0,
                  bad: t.ratingBad ?? 0,
                },
              }
            : undefined,
        reportId: t.report?.id,
      },
    };
  });

  // upload data (CSV/XLSX/JSON) and import into DB
  app.post("/api/tasks/:id/data", async (req, reply) => {
    const id = (req.params as any).id as string;
    const t = await prisma.task.findUnique({ where: { id } });
    if (!t) return reply.code(404).send({ error: "任务不存在" });

    const file = await (req as any).file?.();
    if (!file) return reply.code(400).send({ error: "请上传文件字段 file（CSV/XLSX/JSON）" });

    let rows: ReturnType<typeof parseImportedFile>;
    try {
      const buf = await file.toBuffer();
      rows = parseImportedFile(file.filename ?? "data.csv", buf);
    } catch (e: any) {
      return reply.code(400).send({ error: e?.message ?? "导入失败：文件解析错误" });
    }

    if (!rows.length) return reply.code(400).send({ error: "未解析到任何评论行，请检查文件内容/表头" });

    // 重新导入：先清理旧数据（MVP：按 task 维度覆盖）
    await prisma.comment.deleteMany({ where: { taskId: id } });
    await prisma.product.deleteMany({ where: { taskId: id } });

    // products
    const productUrlSet = new Set<string>();
    for (const r of rows) {
      if (r.productUrl) productUrlSet.add(r.productUrl);
    }
    const productUrls = Array.from(productUrlSet).slice(0, 200);
    const productIdByUrl = new Map<string, string>();

    if (productUrls.length) {
      const data = productUrls.map((url) => ({
        id: `p_${nanoid(10)}`,
        taskId: id,
        url,
        title: rows.find((x) => x.productUrl === url)?.productTitle ?? null,
      }));
      await prisma.product.createMany({ data, skipDuplicates: true });

      const created = await prisma.product.findMany({ where: { taskId: id, url: { in: productUrls } } });
      for (const p of created) productIdByUrl.set(p.url, p.id);
    }

    // comments
    const commentsData = rows.slice(0, 10000).map((r, idx) => ({
      id: `c_${nanoid(10)}_${idx}`,
      taskId: id,
      productId: r.productUrl ? productIdByUrl.get(r.productUrl) ?? null : null,
      rating: Math.max(1, Math.min(5, Number(r.rating ?? 5))),
      commentAt: r.commentAt ?? new Date(),
      content: r.content,
      appendContent: r.appendContent ?? "",
      sku: r.sku ?? "",
      likeCount: r.likeCount ?? 0,
      raw: (r.raw ?? null) as any,
    }));
    await prisma.comment.createMany({ data: commentsData, skipDuplicates: true });

    const importedComments = await prisma.comment.count({ where: { taskId: id } });
    const importedProducts = await prisma.product.count({ where: { taskId: id } });

    const now = new Date();
    await prisma.task.update({
      where: { id },
      data: {
        status: "TO_ANALYZE",
        progress: 20,
        products: importedProducts,
        comments: importedComments,
        logs: {
          create: [
            {
              id: `l_${nanoid(10)}`,
              at: now,
              level: "info",
              message: `数据导入完成：商品 ${importedProducts} 个，评论 ${importedComments} 条。可开始分析。`,
            },
          ],
        },
      },
    });

    return reply.send({ ok: true, imported: { products: importedProducts, comments: importedComments } });
  });

  // run (enqueue)
  app.post("/api/tasks/:id/run", async (req, reply) => {
    const id = (req.params as any).id as string;
    const t = await prisma.task.findUnique({
      where: { id },
      include: { logs: { orderBy: { at: "asc" } }, report: true },
    });
    if (!t) return reply.code(404).send({ error: "任务不存在" });

    const imported = await prisma.comment.count({ where: { taskId: id } });
    if (imported <= 0) return reply.code(400).send({ error: "未检测到已导入数据，请先上传 CSV/XLSX/JSON" });

    const now = new Date();
    const updated = await prisma.task.update({
      where: { id },
      data: {
        status: "ANALYZING",
        progress: 40,
        logs: {
          create: [{ id: `l_${nanoid(10)}`, at: now, level: "info", message: "数据已就绪，开始分析。" }],
        },
      },
      include: { logs: { orderBy: { at: "asc" } }, report: true },
    });

    const job = await taskQueue.add("run-task", { taskId: id }, { attempts: 1 });
    // 对齐前端：返回 task（前端点击后可手动刷新看到进度/最终 reportId）
    return reply.send({
      task: {
        id: updated.id,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        platform: toCNPlatform(updated.platform),
        category: toCNCategory(updated.category),
        keyword: updated.keyword,
        prompt: updated.prompt,
        config: {
          sampleSize: updated.sampleSize,
          timeRangeMonths: updated.timeRangeMonths,
          ratingFilter: toCNRatingFilter(updated.ratingFilter),
          analysisFocus: updated.analysisFocus,
        },
        status: toCNStatus(updated.status),
        progress: updated.progress,
        logs: updated.logs.map((l) => ({ at: l.at.toISOString(), level: l.level as any, message: l.message })),
        stats:
          updated.comments != null
            ? {
                products: updated.products ?? 0,
                comments: updated.comments ?? 0,
                ratingDist: {
                  good: updated.ratingGood ?? 0,
                  neutral: updated.ratingNeutral ?? 0,
                  bad: updated.ratingBad ?? 0,
                },
              }
            : undefined,
        reportId: updated.report?.id,
      },
      jobId: job.id,
      reportId: updated.report?.id ?? null,
    });
  });
}
