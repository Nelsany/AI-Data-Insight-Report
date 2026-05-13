import type { z } from "zod";
import { CategorySchema, ParseResponseSchema } from "../schemas";

type Parsed = z.infer<typeof ParseResponseSchema>;

function containsAny(text: string, kws: string[]) {
  return kws.some((k) => text.includes(k));
}

export function fallbackParse(prompt: string): Parsed {
  const p = prompt.trim();

  let category: z.infer<typeof CategorySchema> = "香水";
  if (containsAny(p, ["口红", "唇膏", "唇釉"])) category = "口红";
  if (containsAny(p, ["面膜", "贴片", "泥膜", "睡眠面膜"])) category = "面膜";
  if (containsAny(p, ["香水", "香氛", "古龙", "香味"])) category = "香水";

  let keyword: string = category;
  const m = p.match(/关键词[:：]\s*([^\s，。]+)/);
  if (m?.[1]) keyword = m[1];

  let ratingFilter: Parsed["config"]["ratingFilter"] = "全部";
  if (containsAny(p, ["差评", "负面", "吐槽"])) ratingFilter = "差评";
  if (containsAny(p, ["好评", "正面", "夸"])) ratingFilter = "好评";

  let analysisFocus = "核心痛点与卖点";
  if (containsAny(p, ["差评原因", "差评", "吐槽", "问题"])) analysisFocus = "差评原因/核心痛点";
  if (containsAny(p, ["卖点", "亮点", "优势", "好评点"])) analysisFocus = "核心卖点/用户偏好";

  let timeRangeMonths = 3;
  const m2 = p.match(/近\s*(\d+)\s*个?月/);
  if (m2?.[1]) timeRangeMonths = Math.max(1, Math.min(12, Number(m2[1])));

  let sampleSize = 2000;
  const m3 = p.match(/(\d+)\s*条/);
  if (m3?.[1]) sampleSize = Math.max(200, Math.min(5000, Number(m3[1])));

  return {
    category,
    keyword,
    config: { sampleSize, timeRangeMonths, ratingFilter, analysisFocus },
  };
}
