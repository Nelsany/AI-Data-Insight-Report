import type { Report, Task } from "@/lib/types";

function iso(daysAgo: number) {
  const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  return d.toISOString();
}

export const MOCK_TASKS: Task[] = [
  {
    id: "t_demo_perfume_001",
    createdAt: iso(2),
    updatedAt: iso(0),
    platform: "淘宝",
    category: "香水",
    keyword: "木质调",
    prompt: "分析淘宝香水评论（木质调），近3个月 2000条，重点看差评原因并出报告",
    config: { sampleSize: 2000, timeRangeMonths: 3, ratingFilter: "全部", analysisFocus: "差评原因 / 真实吐槽点" },
    status: "已发布",
    progress: 100,
    logs: [
      { at: iso(2), level: "info", message: "任务已创建，请先导入评论数据。" },
      { at: iso(2), level: "info", message: "数据导入完成：商品 23 个，评论 2000 条。可开始分析。" },
      { at: iso(2), level: "info", message: "数据已就绪，开始分析。" },
      { at: iso(2), level: "info", message: "数据已加载：商品 23 个，评论 2000 条。" },
      { at: iso(1), level: "info", message: "分析完成。" },
      { at: iso(1), level: "info", message: "报告已生成并发布（分享链接可用）。" },
    ],
    stats: {
      products: 23,
      comments: 2000,
      ratingDist: { good: 1320, neutral: 410, bad: 270 },
    },
    reportId: "r_demo_perfume_001",
  },
  {
    id: "t_demo_lipstick_002",
    createdAt: iso(1),
    updatedAt: iso(0),
    platform: "淘宝",
    category: "口红",
    keyword: "显色/掉色",
    prompt: "分析口红评论，重点看掉色/拔干/色差的吐槽点，出一份报告",
    config: { sampleSize: 1200, timeRangeMonths: 2, ratingFilter: "差评", analysisFocus: "掉色/拔干/色差/包装" },
    status: "分析中",
    progress: 65,
    logs: [
      { at: iso(1), level: "info", message: "任务已创建，请先导入评论数据。" },
      { at: iso(1), level: "info", message: "数据导入完成：商品 8 个，评论 1268 条。可开始分析。" },
      { at: iso(1), level: "info", message: "数据已就绪，开始分析。" },
      { at: iso(0), level: "info", message: "数据已加载：商品 8 个，评论 1200 条。" },
      { at: iso(0), level: "info", message: "正在抽取主题并聚合证据…" },
    ],
    stats: {
      products: 8,
      comments: 1200,
      ratingDist: { good: 0, neutral: 0, bad: 1200 },
    },
  },
];

export const MOCK_REPORTS: Record<string, Report> = {
  r_demo_perfume_001: {
    id: "r_demo_perfume_001",
    taskId: "t_demo_perfume_001",
    createdAt: iso(1),
    title: "香水｜淘宝评论洞察报告",
    subtitle: "关键词「木质调」｜样本 2000 条",
    overview: {
      keyword: "木质调",
      category: "香水",
      sampleSize: 2000,
      timeRangeMonths: 3,
      products: 23,
      comments: 2000,
      ratingDist: { good: 1320, neutral: 410, bad: 270 },
    },
    keyFindings: [
      "差评主要集中在“留香时长不达预期”与“味道偏甜/晕香”两类感知落差，建议在详情页用更具体的场景描述替代抽象的‘高级感’。",
      "正面卖点集中在“质感包装 + 送礼体面”，但也出现‘包装破损/漏液’导致的体验反噬，需优先优化喷头与外箱缓冲。",
      "“木质调”用户对层次变化敏感，追评里对前调/中调/后调的描述更集中，可作为内容种草的素材来源。",
    ],
    pains: [
      {
        title: "留香不持久",
        summary: "与预期强留香不一致，尤其通勤场景更明显。",
        percent: 21,
        n: 178,
        keywords: ["留香", "持久", "淡", "两小时", "闻不到"],
        evidences: ["刚喷很香，两个小时后基本闻不到了。", "留香太短了，出门一会儿就没味道。", "味道可以，但持久度不行。"],
      },
      {
        title: "味道偏甜/晕香",
        summary: "部分用户反馈甜腻、晕香、闻久不适。",
        percent: 17,
        n: 146,
        keywords: ["甜", "腻", "晕", "刺鼻", "上头"],
        evidences: ["有点甜腻，闻久了会晕。", "不是想象中的木质，偏甜。", "晕香体质慎入。"],
      },
      {
        title: "喷头漏液/按压不顺",
        summary: "结构问题导致漏液或喷雾不均，影响使用体验。",
        percent: 12,
        n: 103,
        keywords: ["喷头", "漏", "按不动", "喷不出来"],
        evidences: ["喷头漏液，放包里全是味道。", "按压不顺，喷出来一坨。", "喷头感觉很廉价。"],
      },
    ],
    highlights: [
      {
        title: "质感包装",
        summary: "瓶身与外观设计被频繁提及，适合送礼。",
        percent: 26,
        n: 312,
        keywords: ["包装", "瓶身", "高级", "颜值", "送礼"],
        evidences: ["瓶子很好看，摆着就很高级。", "送礼很体面，包装质感在线。", "颜值太高了，拍照很好看。"],
      },
      {
        title: "前调干净",
        summary: "前调被描述为清爽干净，男女皆可。",
        percent: 18,
        n: 216,
        keywords: ["干净", "清爽", "不腻", "中性"],
        evidences: ["前调很干净，不腻。", "清爽中性，男女都能用。", "闻起来很舒服。"],
      },
      {
        title: "性价比",
        summary: "在同价位里被认为‘不踩雷’，复购意愿较高。",
        percent: 14,
        n: 168,
        keywords: ["性价比", "划算", "复购", "值"],
        evidences: ["这个价位挺值的。", "不踩雷，考虑回购。", "对得起价格。"],
      },
    ],
    topWords: [
      { word: "留香", count: 468 },
      { word: "味道", count: 402 },
      { word: "高级", count: 245 },
      { word: "甜", count: 188 },
      { word: "包装", count: 176 },
      { word: "喷头", count: 131 },
      { word: "通勤", count: 92 },
      { word: "送礼", count: 88 },
    ],
  },
};
