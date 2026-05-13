export type Category = "香水" | "口红" | "面膜";

export type Topic = {
  title: string;
  summary: string;
  percent: number;
  n: number;
  keywords: string[];
  evidences: string[];
};

export type Report = {
  id: string;
  taskId: string;
  createdAt: string;
  title: string;
  subtitle: string;
  overview: {
    keyword: string;
    category: Category;
    sampleSize: number;
    timeRangeMonths: number;
    products: number;
    comments: number;
    ratingDist: { good: number; neutral: number; bad: number };
  };
  keyFindings: string[];
  pains: Topic[];
  highlights: Topic[];
  topWords: Array<{ word: string; count: number }>;
};

