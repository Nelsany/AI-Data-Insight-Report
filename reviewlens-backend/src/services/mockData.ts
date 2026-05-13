export type Comment = {
  id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  date: string;
  content: string;
  appendContent?: string;
  sku?: string;
  likeCount?: number;
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

export function generateMockComments({
  seed,
  keyword,
  count,
}: {
  seed: string;
  keyword: string;
  count: number;
}): { products: number; comments: Comment[] } {
  const s = Array.from(seed).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rng = mulberry32(s);
  const products = 8 + Math.floor(rng() * 18);

  const starters = ["用了", "第一次用", "买来", "试了", "刚收到", "对比了", "给对象买的", "通勤用"];
  const tail = [
    "希望后续能改进。",
    "可能因人而异。",
    "价格如果再友好点就更好了。",
    "包装要是再用心点就完美。",
    "物流还行。",
  ];

  const negatives = ["有点失望", "不太行", "踩雷", "一般般", "不推荐"];
  const positives = ["很喜欢", "挺惊喜", "超出预期", "会回购", "推荐"];

  const comments: Comment[] = Array.from({ length: count }, (_, i) => {
    const isBad = rng() < 0.28;
    const rating = (isBad ? pick(rng, [1, 2]) : pick(rng, [4, 5])) as 1 | 2 | 3 | 4 | 5;
    const sentiment = isBad ? pick(rng, negatives) : pick(rng, positives);
    const d = new Date(Date.now() - Math.floor(rng() * 1000 * 60 * 60 * 24 * 90));
    const sku = pick(rng, ["默认", "小样", "正装", "礼盒", "01", "02", "干皮", "敏感肌"]);
    const likeCount = Math.floor(rng() * 58);
    return {
      id: `${seed}_${i}`,
      rating,
      date: d.toISOString(),
      content: `${pick(rng, starters)}「${keyword}」，${sentiment}。${pick(rng, tail)}`,
      appendContent: rng() < 0.35 ? `追评：${pick(rng, starters)}一周后，整体还是${sentiment}。` : "",
      sku,
      likeCount,
    };
  });

  return { products, comments };
}
