import { env } from "../env";

export type OpenAICompatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function openaiCompatChatJSON<T>({
  messages,
  jsonSchemaHint,
}: {
  messages: OpenAICompatMessage[];
  jsonSchemaHint: string;
}): Promise<T> {
  if (!env.LLM_BASE_URL || !env.LLM_API_KEY || !env.LLM_MODEL) {
    throw new Error("LLM 未配置（需要 LLM_BASE_URL / LLM_API_KEY / LLM_MODEL）");
  }

  const url = env.LLM_BASE_URL.replace(/\/$/, "") + "/chat/completions";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${env.LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.LLM_MODEL,
      temperature: env.LLM_TEMPERATURE,
      messages: [
        ...messages,
        {
          role: "system",
          content:
            "你必须只输出严格 JSON，不要输出多余解释文字。JSON 必须可被 JSON.parse 直接解析。\n" +
            "输出结构要求：\n" +
            jsonSchemaHint,
        },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`LLM 请求失败：${res.status} ${res.statusText} ${text}`);
  }

  const data = (await res.json()) as any;
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") throw new Error("LLM 返回为空");

  // 有些网关会把 JSON 包在 ```json ``` 中，这里做轻量剥离
  const cleaned = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(cleaned) as T;
}
