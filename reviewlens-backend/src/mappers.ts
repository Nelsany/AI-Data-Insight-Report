import { Category, Platform, RatingFilter, TaskStatus } from "@prisma/client";

export function toCNCategory(c: Category): "香水" | "口红" | "面膜" {
  switch (c) {
    case "PERFUME":
      return "香水";
    case "LIPSTICK":
      return "口红";
    case "MASK":
      return "面膜";
  }
}

export function fromCNCategory(c: string): Category {
  if (c === "香水") return "PERFUME";
  if (c === "口红") return "LIPSTICK";
  if (c === "面膜") return "MASK";
  return "PERFUME";
}

export function toCNStatus(s: TaskStatus):
  | "待执行"
  | "抓取中"
  | "待分析"
  | "分析中"
  | "待出报告"
  | "已发布"
  | "失败"
  | "已取消" {
  switch (s) {
    case "PENDING":
      return "待执行";
    case "CRAWLING":
      return "抓取中";
    case "TO_ANALYZE":
      return "待分析";
    case "ANALYZING":
      return "分析中";
    case "TO_REPORT":
      return "待出报告";
    case "PUBLISHED":
      return "已发布";
    case "FAILED":
      return "失败";
    case "CANCELED":
      return "已取消";
  }
}

export function toCNRatingFilter(r: RatingFilter): "全部" | "好评" | "中评" | "差评" {
  switch (r) {
    case "ALL":
      return "全部";
    case "GOOD":
      return "好评";
    case "NEUTRAL":
      return "中评";
    case "BAD":
      return "差评";
  }
}

export function fromCNRatingFilter(r: string): RatingFilter {
  if (r === "好评") return "GOOD";
  if (r === "中评") return "NEUTRAL";
  if (r === "差评") return "BAD";
  return "ALL";
}

export const toCNPlatform = (_: Platform): "淘宝" => "淘宝";

