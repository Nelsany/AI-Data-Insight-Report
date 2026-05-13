import { Report, Task } from "@/lib/types";

/**
 * 说明：
 * 早期前端为了“无后端演示”使用本地文件存储（.data/*.json）。
 * 当前版本已切换为“独立后端 + Next.js rewrites”，这里改为在服务端直接请求后端 API。
 *
 * 约定：
 * - BACKEND_URL 由 next.config.ts rewrites 同名环境变量复用（默认 http://localhost:4000）
 * - 这些方法仅在 Server Component / Route Handler 中使用
 */
import { MOCK_REPORTS, MOCK_TASKS } from "@/lib/mockData";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";
const MOCK_MODE = ["1", "true", "TRUE", "yes", "YES"].includes(String(process.env.MOCK_DATA ?? ""));

async function apiGet<T>(path: string): Promise<T> {
  const url = `${BACKEND_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  const res = await fetch(url, {
    // 任务/报告需要实时读取，避免 Next 的默认缓存
    cache: "no-store",
    headers: { accept: "application/json" },
  });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error ?? `请求失败：${res.status}`);
  return json as T;
}

export async function listTasks(): Promise<Task[]> {
  if (MOCK_MODE) {
    return MOCK_TASKS.slice().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }
  const data = await apiGet<{ tasks: Task[] }>("/api/tasks");
  return (data.tasks ?? []).slice().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export async function getTask(id: string): Promise<Task | null> {
  if (MOCK_MODE) {
    return MOCK_TASKS.find((t) => t.id === id) ?? null;
  }
  const url = `${BACKEND_URL}/api/tasks/${id}`;
  const res = await fetch(url, { cache: "no-store", headers: { accept: "application/json" } });
  if (res.status === 404) return null;
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error ?? `请求失败：${res.status}`);
  return (json as any)?.task ?? null;
}

export async function getReport(id: string): Promise<Report | null> {
  if (MOCK_MODE) {
    return MOCK_REPORTS[id] ?? null;
  }
  const url = `${BACKEND_URL}/api/reports/${id}`;
  const res = await fetch(url, { cache: "no-store", headers: { accept: "application/json" } });
  if (res.status === 404) return null;
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error ?? `请求失败：${res.status}`);
  return (json as any)?.report ?? null;
}
