import type { FastifyInstance } from "fastify";
import { ParseRequestSchema, ParseResponseSchema } from "../schemas";
import { fallbackParse } from "../services/fallbackParse";
import { openaiCompatChatJSON } from "../services/openaiCompat";

export async function registerParseRoutes(app: FastifyInstance) {
  app.post("/api/parse", async (req, reply) => {
    const parsedReq = ParseRequestSchema.safeParse(req.body);
    if (!parsedReq.success) return reply.code(400).send({ error: "缺少 prompt" });

    const { prompt } = parsedReq.data;

    // 优先 LLM；没有配置则降级规则解析（便于你先跑通后端与前端联调）
    try {
      const llm = await openaiCompatChatJSON<unknown>({
        messages: [
          {
            role: "system",
            content:
              "你是电商评论洞察产品的任务解析器。请把用户中文指令解析成结构化参数，用于淘宝关键词抓取与分析。",
          },
          { role: "user", content: prompt },
        ],
        jsonSchemaHint:
          "{ category: '香水'|'口红'|'面膜', keyword: string, config: { sampleSize: number(200-5000), timeRangeMonths: number(1-12), ratingFilter: '全部'|'好评'|'中评'|'差评', analysisFocus: string } }",
      });

      const validated = ParseResponseSchema.safeParse(llm);
      if (validated.success) return reply.send(validated.data);
    } catch {
      // ignore -> fallback
    }

    return reply.send(fallbackParse(prompt));
  });
}
