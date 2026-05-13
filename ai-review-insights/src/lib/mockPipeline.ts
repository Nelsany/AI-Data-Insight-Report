import { Category, Report, Task, Topic } from "@/lib/types";

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: T[]) {
  return arr[Math.floor(rng() * arr.length)];
}

const CATEGORY_DIC: Record<
  Category,
  { pains: Array<{ title: string; kws: string[] }>; highlights: Array<{ title: string; kws: string[] }> }
> = {
  香水: {
    pains: [
      { title: "留香不够", kws: ["留香", "不持久", "很快没味", "撑不过"] },
      { title: "味道不符合预期", kws: ["味道", "像", "怪", "甜腻", "齁", "不高级"] },
      { title: "刺鼻/晕香", kws: ["刺鼻", "头晕", "晕", "熏", "酒精味"] },
      { title: "包装/漏液", kws: ["漏", "喷头", "瓶", "包装", "破损"] },
      { title: "真假/渠道担忧", kws: ["假", "正品", "专柜", "批次"] },
    ],
    highlights: [
      { title: "高级耐闻", kws: ["高级", "耐闻", "清新", "干净", "好闻"] },
      { title: "留香在线", kws: ["留香久", "持久", "一整天"] },
      { title: "适合通勤", kws: ["通勤", "日常", "不扰人"] },
      { title: "送礼体面", kws: ["送礼", "礼盒", "颜值", "体面"] },
    ],
  },
  口红: {
    pains: [
      { title: "拔干/起皮", kws: ["拔干", "干", "起皮", "显唇纹"] },
      { title: "掉色/沾杯", kws: ["掉色", "沾杯", "不持久", "糊"] },
      { title: "色差", kws: ["色差", "不一样", "和图不符", "偏"] },
      { title: "显唇纹", kws: ["显唇纹", "纹路", "卡"] },
      { title: "包装廉价", kws: ["包装", "廉价", "掉漆", "松"] },
    ],
    highlights: [
      { title: "显色好", kws: ["显色", "饱和", "一抹上色"] },
      { title: "质地舒服", kws: ["丝滑", "轻薄", "不黏", "舒服"] },
      { title: "黄皮友好", kws: ["显白", "黄皮", "提气色"] },
      { title: "不沾杯", kws: ["不沾杯", "成膜", "牢"] },
    ],
  },
  面膜: {
    pains: [
      { title: "刺激/过敏", kws: ["刺激", "过敏", "红", "痒", "刺痛"] },
      { title: "精华太少/太黏", kws: ["精华", "少", "黏", "粘", "糊"] },
      { title: "不服帖", kws: ["不服帖", "太大", "太小", "贴合"] },
      { title: "补水不明显", kws: ["补水", "没感觉", "不够", "干"] },
      { title: "气味难闻", kws: ["气味", "香精", "难闻"] },
    ],
    highlights: [
      { title: "补水明显", kws: ["补水", "水润", "滋润", "皮肤软"] },
      { title: "温和不刺激", kws: ["温和", "不刺激", "敏感肌"] },
      { title: "服帖好用", kws: ["服帖", "贴合", "剪裁"] },
      { title: "第二天状态好", kws: ["第二天", "透亮", "稳定"] },
    ],
  },
};

function makeEvidence(rng: () => number, title: string, kws: string[], keyword: string) {
  const starters = ["用了", "第一次用", "买来", "试了", "刚收到", "对比了", "给对象买的", "通勤用"];
  const tones = [
    "感觉",
    "真的",
    "有点",
    "非常",
    "完全",
    "总体",
    "说实话",
    "意外地",
    "没想到",
  ];
  const tail = [
    "希望后续能改进。",
    "可能因人而异。",
    "价格如果再友好点就更好了。",
    "包装要是再用心点就完美。",
    "物流还行。",
  ];

  const kw = pick(rng, kws);
  return `${pick(rng, starters)}「${keyword}」，${pick(rng, tones)}${title}，${kw}特别明显。${pick(
    rng,
    tail,
  )}`;
}

function topicFromBucket(
  rng: () => number,
  bucket: { title: string; kws: string[] },
  total: number,
  keyword: string,
): Topic {
  const percent = Math.round((0.08 + rng() * 0.22) * 100); // 8% ~ 30%
  const n = Math.max(10, Math.round((percent / 100) * total));
  const evidences = Array.from({ length: 5 }, () => makeEvidence(rng, bucket.title, bucket.kws, keyword));
  return {
    title: bucket.title,
    summary: `围绕「${bucket.title}」的反馈集中出现，用户提到 ${bucket.kws.slice(0, 2).join(" / ")} 等关键词。`,
    percent,
    n,
    keywords: bucket.kws.slice(0, 5),
    evidences,
  };
}

export function runMockPipeline(task: Task): { task: Task; report: Report } {
  const seed = Array.from(task.id).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rng = mulberry32(seed);

  const products = 8 + Math.floor(rng() * 18);
  const comments = Math.min(task.config.sampleSize, 800 + Math.floor(rng() * 2200));
  const good = Math.round(comments * (0.55 + rng() * 0.2));
  const neutral = Math.round(comments * (0.12 + rng() * 0.08));
  const bad = Math.max(0, comments - good - neutral);

  const dic = CATEGORY_DIC[task.category];
  const pains = dic.pains.map((b) => topicFromBucket(rng, b, Math.max(200, bad), task.keyword));
  pains.sort((a, b) => b.percent - a.percent);

  const highlights = dic.highlights.map((b) => topicFromBucket(rng, b, Math.max(200, good), task.keyword));
  highlights.sort((a, b) => b.percent - a.percent);

  const wordPool = [
    ...dic.pains.flatMap((p) => p.kws),
    ...dic.highlights.flatMap((h) => h.kws),
    "性价比",
    "包装",
    "物流",
    "客服",
    "味道",
    "显色",
    "补水",
    "持久",
  ];

  const topWords = Array.from({ length: 16 }, () => pick(rng, wordPool)).reduce(
    (acc, w) => {
      acc[w] = (acc[w] ?? 0) + 1 + Math.floor(rng() * 6);
      return acc;
    },
    {} as Record<string, number>,
  );

  const topWordsArr = Object.entries(topWords)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const keyFindings = [
    `负面反馈主要集中在「${pains[0]?.title}」与「${pains[1]?.title}」，合计覆盖较大比例的差评样本。`,
    `正面卖点中「${highlights[0]?.title}」提及频次最高，可作为内容与详情页主卖点方向。`,
    `非商品因素（物流/包装/客服）在样本中也有出现，建议在报告中单列关注。`,
  ];

  const now = new Date().toISOString();
  const reportId = `r_${task.id}`;

  const report: Report = {
    id: reportId,
    taskId: task.id,
    createdAt: now,
    title: `${task.category}｜淘宝评论洞察报告`,
    subtitle: `关键词「${task.keyword}」｜近 ${task.config.timeRangeMonths} 个月｜样本 ${comments} 条`,
    overview: {
      keyword: task.keyword,
      category: task.category,
      sampleSize: task.config.sampleSize,
      timeRangeMonths: task.config.timeRangeMonths,
      products,
      comments,
      ratingDist: { good, neutral, bad },
    },
    keyFindings,
    pains: pains.slice(0, 10),
    highlights: highlights.slice(0, 10),
    topWords: topWordsArr,
  };

  const newTask: Task = {
    ...task,
    updatedAt: now,
    status: "已发布",
    progress: 100,
    reportId,
    stats: {
      products,
      comments,
      ratingDist: { good, neutral, bad },
    },
    logs: [
      ...task.logs,
      { at: now, level: "info", message: `抓取完成：商品 ${products} 个，评论 ${comments} 条。` },
      { at: now, level: "info", message: "分析完成：已生成痛点/卖点主题与证据引用。" },
      { at: now, level: "info", message: "报告已生成并发布（分享链接可用）。" },
    ],
  };

  return { task: newTask, report };
}

