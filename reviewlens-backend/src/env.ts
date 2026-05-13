import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.string().default("development"),
  FRONTEND_ORIGIN: z.string().default("http://localhost:3000"),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  LLM_BASE_URL: z.string().optional().or(z.literal("")),
  LLM_API_KEY: z.string().optional().or(z.literal("")),
  LLM_MODEL: z.string().optional().or(z.literal("")),
  LLM_TEMPERATURE: z.coerce.number().default(0.2),
  CRAWL_MODE: z.enum(["MOCK", "PLAYWRIGHT"]).default("MOCK"),

  /**
   * 代理池：逗号分隔
   * 例：
   * PROXY_URLS=http://user:pass@1.2.3.4:8000, http://user:pass@5.6.7.8:8000
   * 也支持 socks5://...
   */
  PROXY_URLS: z.string().optional().or(z.literal("")),
  PROXY_STRATEGY: z.enum(["random", "round_robin"]).default("random"),

  /**
   * Playwright 行为
   * - 想人工过验证码：建议 PLAYWRIGHT_HEADLESS=false
   */
  PLAYWRIGHT_HEADLESS: z
    .string()
    .optional()
    .transform((v) => (v == null || v === "" ? "false" : v))
    .pipe(z.enum(["true", "false"]))
    .transform((v) => v === "true"),
  CAPTCHA_WAIT_MS: z.coerce.number().default(5 * 60 * 1000),
  REQUEST_DELAY_MS: z.coerce.number().default(1200),
});

export const env = EnvSchema.parse(process.env);
