import type { FastifyInstance } from "fastify";
import { prisma } from "../prisma";
import { toCNCategory } from "../mappers";

export async function registerReportRoutes(app: FastifyInstance) {
  app.get("/api/reports/:id", async (req, reply) => {
    const id = (req.params as any).id as string;
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        task: true,
        topics: { include: { evidences: true } },
      },
    });
    if (!report) return reply.code(404).send({ error: "报告不存在" });

    const task = report.task;
    const pains = report.topics
      .filter((t) => t.kind === "pain")
      .map((t) => ({
        title: t.title,
        summary: t.summary,
        percent: t.percent,
        n: t.n,
        keywords: t.keywords,
        evidences: t.evidences.map((e) => e.content),
      }));
    const highlights = report.topics
      .filter((t) => t.kind === "highlight")
      .map((t) => ({
        title: t.title,
        summary: t.summary,
        percent: t.percent,
        n: t.n,
        keywords: t.keywords,
        evidences: t.evidences.map((e) => e.content),
      }));

    const topWords = (report.topWords as any) ?? [];

    return {
      report: {
        id: report.id,
        taskId: report.taskId,
        createdAt: report.createdAt.toISOString(),
        title: report.title,
        subtitle: report.subtitle,
        overview: {
          keyword: task.keyword,
          category: toCNCategory(task.category),
          sampleSize: task.sampleSize,
          timeRangeMonths: task.timeRangeMonths,
          products: task.products ?? 0,
          comments: task.comments ?? 0,
          ratingDist: {
            good: task.ratingGood ?? 0,
            neutral: task.ratingNeutral ?? 0,
            bad: task.ratingBad ?? 0,
          },
        },
        keyFindings: report.keyFindings,
        pains,
        highlights,
        topWords,
      },
    };
  });
}
