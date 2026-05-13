import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { Badge } from "@/components/ui/badge";
import { getTask } from "@/lib/localStore";
import { TaskDetailClient } from "./taskDetailClient";

export default async function TaskDetailPage({ params }: { params: { id: string } }) {
  // Next.js 16：部分运行时 params 可能是 Promise，需要 await 解包
  const { id } = (await Promise.resolve(params)) as { id: string };
  const task = await getTask(id);
  if (!task) return notFound();
  const mockMode = ["1", "true", "TRUE", "yes", "YES"].includes(String(process.env.MOCK_DATA ?? ""));

  return (
    <AppShell headerRight={<Badge tone={task.status === "已发布" ? "green" : "slate"}>{task.status}</Badge>}>
      <TaskDetailClient initialTask={task} mockMode={mockMode} />
    </AppShell>
  );
}
