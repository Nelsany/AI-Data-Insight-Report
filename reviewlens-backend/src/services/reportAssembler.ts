import type { Report as FrontReport, Topic as FrontTopic } from "./reportTypes";

export function assembleFrontReport(params: {
  reportId: string;
  taskId: string;
  createdAt: string;
  title: string;
  subtitle: string;
  overview: FrontReport["overview"];
  keyFindings: string[];
  pains: FrontTopic[];
  highlights: FrontTopic[];
  topWords: FrontReport["topWords"];
}): FrontReport {
  return {
    id: params.reportId,
    taskId: params.taskId,
    createdAt: params.createdAt,
    title: params.title,
    subtitle: params.subtitle,
    overview: params.overview,
    keyFindings: params.keyFindings,
    pains: params.pains,
    highlights: params.highlights,
    topWords: params.topWords,
  };
}

