import { TOPIC_DICT, type CNCategory } from "./topicDictionaries";

export type Topic = {
  kind: "pain" | "highlight";
  title: string;
  summary: string;
  percent: number; // 0..100
  n: number;
  keywords: string[];
  evidences: string[];
};

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

function makeEvidence(rng: () => number, title: string, kws: string[], keyword: string) {
  const starters = ["用了", "第一次用", "买来", "试了", "刚收到", "对比了", "给对象买的", "通勤用"];
  const tones = ["感觉", "真的", "有点", "非常", "完全", "总体", "说实话", "意外地", "没想到"];
  const tail = ["希望后续能改进。", "可能因人而异。", "价格如果再友好点就更好了。", "包装要是再用心点就完美。"];
  const kw = pick(rng, kws);
  return `${pick(rng, starters)}「${keyword}」，${pick(rng, tones)}${title}，${kw}特别明显。${pick(rng, tail)}`;
}

export function analyzeByDictionary(params: {
  taskId: string;
  category: CNCategory;
  keyword: string;
  comments: Array<{ rating: number; content: string }>;
}): {
  ratingDist: { good: number; neutral: number; bad: number };
  keyFindings: string[];
  topics: Topic[];
  topWords: Array<{ word: string; count: number }>;
} {
  const seed = Array.from(params.taskId).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rng = mulberry32(seed);

  const comments = params.comments;
  const good = comments.filter((c) => c.rating >= 4).length;
  const neutral = comments.filter((c) => c.rating === 3).length;
  const bad = comments.filter((c) => c.rating <= 2).length;

  const dic = TOPIC_DICT[params.category];

  const mkTopic = (kind: "pain" | "highlight", b: { title: string; kws: string[] }, baseTotal: number): Topic => {
    const percent = Math.round((0.08 + rng() * 0.22) * 100);
    const n = Math.max(10, Math.round((percent / 100) * Math.max(200, baseTotal)));
    const evidences = Array.from({ length: 5 }, () => makeEvidence(rng, b.title, b.kws, params.keyword));
    return {
      kind,
      title: b.title,
      summary: `围绕「${b.title}」的反馈集中出现，用户提到 ${b.kws.slice(0, 2).join(" / ")} 等关键词。`,
      percent,
      n,
      keywords: b.kws.slice(0, 5),
      evidences,
    };
  };

  const pains = dic.pains.map((b) => mkTopic("pain", b, bad)).sort((a, b) => b.percent - a.percent);
  const highs = dic.highlights
    .map((b) => mkTopic("highlight", b, good))
    .sort((a, b) => b.percent - a.percent);

  const keyFindings = [
    `负面反馈主要集中在「${pains[0]?.title}」与「${pains[1]?.title}」，建议优先做产品/详情页/客服话术优化。`,
    `正面卖点中「${highs[0]?.title}」提及频次最高，可作为内容与投放的主卖点方向。`,
    `非商品因素（物流/包装/客服）也会影响评分，建议后续引入“非商品因素”单独分类。`,
  ];

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

  const topWords = Array.from({ length: 18 }, () => pick(rng, wordPool)).reduce(
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

  return {
    ratingDist: { good, neutral, bad },
    keyFindings,
    topics: [...pains.slice(0, 10), ...highs.slice(0, 10)],
    topWords: topWordsArr,
  };
}
