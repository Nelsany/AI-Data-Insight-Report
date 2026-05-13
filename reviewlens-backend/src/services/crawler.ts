import { env } from "../env";
import { generateMockComments } from "./mockData";

/**
 * 数据导入版（按 PRD 调整）：
 * 首期不再通过爬虫抓取电商平台数据，避免风控与不可控性。
 * 数据入口：/api/tasks/:id/data（CSV/XLSX/JSON）。
 *
 * 该文件仅保留 MOCK 能力用于开发联调；真实爬虫已禁用。
 */
export async function crawlTaobaoByKeyword(params: {
  taskId: string;
  categoryCN: "香水" | "口红" | "面膜";
  keyword: string;
  sampleSize: number;
  timeRangeMonths: number;
  ratingFilterCN: "全部" | "好评" | "中评" | "差评";
}): Promise<{
  products: number;
  productUrls?: string[];
  comments: Array<{
    rating: number;
    date: string;
    content: string;
    appendContent?: string;
    sku?: string;
    likeCount?: number;
    raw?: any;
  }>;
}> {
  if (env.CRAWL_MODE === "MOCK") {
    const { products, comments } = generateMockComments({
      seed: params.taskId,
      keyword: params.keyword,
      count: Math.min(params.sampleSize, 2200),
    });
    return { products, productUrls: [], comments };
  }

  throw new Error("爬虫已在首期禁用：请使用数据导入接口 /api/tasks/:id/data 上传 CSV/XLSX/JSON");
}
