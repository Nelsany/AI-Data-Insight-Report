import { Worker } from "bullmq";
import { nanoid } from "nanoid";
import { prisma } from "./prisma";
import { connection, type RunTaskJob } from "./queue/queue";
import { toCNCategory } from "./mappers";
import { analyzeByDictionary } from "./services/analyzer";

export function startWorker() {
  const worker = new Worker<RunTaskJob>(
    "tasks",
    async (job) => {
      const { taskId } = job.data;
      const task = await prisma.task.findUnique({ where: { id: taskId } });
      if (!task) throw new Error("任务不存在");

      const now = new Date();
      await prisma.taskLog.create({
        data: { id: `l_${nanoid(10)}`, taskId, at: now, level: "info", message: "开始分析（使用导入数据）。" },
      });

      // 1) load imported comments
      const comments = await prisma.comment.findMany({
        where: { taskId },
        orderBy: { commentAt: "desc" },
        take: task.sampleSize,
      });
      if (!comments.length) throw new Error("未导入任何评论数据，请先上传 CSV/XLSX/JSON");

      const ratingGood = comments.filter((c) => c.rating >= 4).length;
      const ratingNeutral = comments.filter((c) => c.rating === 3).length;
      const ratingBad = comments.filter((c) => c.rating <= 2).length;
      const products = await prisma.product.count({ where: { taskId } });

      await prisma.task.update({
        where: { id: taskId },
        data: {
          status: "ANALYZING",
          progress: 60,
          products,
          comments: comments.length,
          ratingGood,
          ratingNeutral,
          ratingBad,
          logs: {
            create: [
              {
                id: `l_${nanoid(10)}`,
                at: new Date(),
                level: "info",
                message: `数据已加载：商品 ${products} 个，评论 ${comments.length} 条。`,
              },
            ],
          },
        },
      });

      // 2) analyze
      const analysis = analyzeByDictionary({
        taskId,
        category: toCNCategory(task.category),
        keyword: task.keyword,
        comments: comments.map((c) => ({ rating: c.rating, content: [c.content, c.appendContent].filter(Boolean).join("\n") })),
      });

      // 3) report persist
      const reportId = `r_${nanoid(10)}`;
      const createdAt = new Date();
      const title = `${toCNCategory(task.category)}｜淘宝评论洞察报告`;
      const subtitle = `关键词「${task.keyword}」｜样本 ${comments.length} 条`;

      await prisma.report.create({
        data: {
          id: reportId,
          taskId,
          createdAt,
          title,
          subtitle,
          keyFindings: analysis.keyFindings,
          topWords: analysis.topWords as any,
          topics: {
            create: analysis.topics.map((t) => ({
              id: `tp_${nanoid(10)}`,
              kind: t.kind,
              title: t.title,
              summary: t.summary,
              percent: t.percent,
              n: t.n,
              keywords: t.keywords,
              evidences: {
                create: t.evidences.slice(0, 8).map((e) => ({ id: `ev_${nanoid(10)}`, content: e })),
              },
            })),
          },
        },
      });

      await prisma.task.update({
        where: { id: taskId },
        data: {
          status: "PUBLISHED",
          progress: 100,
          logs: {
            create: [
              { id: `l_${nanoid(10)}`, at: new Date(), level: "info", message: "分析完成。" },
              { id: `l_${nanoid(10)}`, at: new Date(), level: "info", message: "报告已生成并发布（分享链接可用）。" },
            ],
          },
        },
      });

      return { reportId };
    },
    { connection },
  );

  worker.on("failed", async (job, err) => {
    const taskId = (job?.data as any)?.taskId as string | undefined;
    if (!taskId) return;
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: "FAILED",
        logs: {
          create: [
            {
              id: `l_${nanoid(10)}`,
              at: new Date(),
              level: "error",
              message: `任务失败：${err.message}`,
            },
          ],
        },
      },
    });
  });

  return worker;
}
