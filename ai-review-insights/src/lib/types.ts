export type Category = "香水" | "口红" | "面膜";
export type RatingFilter = "全部" | "好评" | "中评" | "差评";

export type TaskStatus =
  | "待执行"
  | "抓取中"
  | "待分析"
  | "分析中"
  | "待出报告"
  | "已发布"
  | "失败"
  | "已取消";

export type TaskConfig = {
  sampleSize: number;
  timeRangeMonths: number;
  ratingFilter: RatingFilter;
  analysisFocus: string;
};

export type Task = {
  id: string;
  createdAt: string;
  updatedAt: string;
  platform: "淘宝";
  category: Category;
  keyword: string;
  prompt: string;
  config: TaskConfig;
  status: TaskStatus;
  progress: number; // 0..100
  logs: Array<{ at: string; message: string; level: "info" | "warn" | "error" }>;
  stats?: {
    products: number;
    comments: number;
    ratingDist: { good: number; neutral: number; bad: number };
  };
  reportId?: string;
};

export type Topic = {
  title: string;
  summary: string;
  percent: number; // 0..100
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

