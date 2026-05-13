import xlsx from "xlsx";
import { parse as parseCsv } from "csv-parse/sync";

export type ImportedRow = {
  productUrl?: string;
  productTitle?: string;
  rating?: number;
  commentAt?: Date;
  content: string;
  appendContent?: string;
  sku?: string;
  likeCount?: number;
  raw?: any;
};

function pick(obj: any, keys: string[]): any {
  for (const k of keys) {
    if (obj?.[k] != null && obj[k] !== "") return obj[k];
  }
  return undefined;
}

function toInt(v: any): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(String(v).trim());
  return Number.isFinite(n) ? n : undefined;
}

function toDate(v: any): Date | undefined {
  if (v == null || v === "") return undefined;
  if (v instanceof Date) return v;
  const s = String(v).trim();
  // excel serial
  if (/^\d+(\.\d+)?$/.test(s) && Number(s) > 20000) {
    const d = xlsx.SSF.parse_date_code(Number(s));
    if (d) return new Date(d.y, d.m - 1, d.d, d.H, d.M, d.S);
  }
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d;
  return undefined;
}

export function parseImportedFile(fileName: string, buf: Buffer): ImportedRow[] {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
    return parseXlsx(buf);
  }
  if (lower.endsWith(".csv") || lower.endsWith(".tsv")) {
    return parseCsvText(buf.toString("utf-8"), lower.endsWith(".tsv") ? "\t" : ",");
  }
  if (lower.endsWith(".json")) {
    const arr = JSON.parse(buf.toString("utf-8"));
    if (!Array.isArray(arr)) throw new Error("JSON 必须是数组，每个元素是一条评论记录");
    return normalizeRows(arr);
  }
  throw new Error("仅支持导入 CSV/TSV/XLSX/JSON");
}

function parseXlsx(buf: Buffer): ImportedRow[] {
  const wb = xlsx.read(buf, { type: "buffer" });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return [];
  const sheet = wb.Sheets[sheetName];
  const json = xlsx.utils.sheet_to_json(sheet, { defval: "" }) as any[];
  return normalizeRows(json);
}

function parseCsvText(text: string, delimiter: string): ImportedRow[] {
  const records = parseCsv(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    delimiter,
  }) as any[];
  return normalizeRows(records);
}

function normalizeRows(rows: any[]): ImportedRow[] {
  const out: ImportedRow[] = [];
  for (const r of rows) {
    const content = String(
      pick(r, ["content", "Content", "正文", "内容", "评论", "comment", "评价内容"]) ?? "",
    ).trim();
    if (!content) continue;

    const rating = toInt(pick(r, ["rating", "Rating", "评分", "星级", "score"]));
    const commentAt = toDate(pick(r, ["commentAt", "date", "时间", "日期", "发表时间", "createdAt"]));

    const productUrl = pick(r, ["productUrl", "商品链接", "链接", "url"]);
    const productTitle = pick(r, ["productTitle", "商品标题", "标题", "title", "商品"]);
    const appendContent = pick(r, ["appendContent", "追评", "追加评论", "append"]);
    const sku = pick(r, ["sku", "规格", "型号", "色号"]);
    const likeCount = toInt(pick(r, ["likeCount", "点赞数", "赞", "useful", "helpful"]));

    out.push({
      productUrl: productUrl ? String(productUrl).trim() : undefined,
      productTitle: productTitle ? String(productTitle).trim() : undefined,
      rating,
      commentAt,
      content,
      appendContent: appendContent ? String(appendContent).trim() : undefined,
      sku: sku ? String(sku).trim() : undefined,
      likeCount,
      raw: r,
    });
  }
  return out;
}

