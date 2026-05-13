import { Suspense } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { Badge } from "@/components/ui/badge";
import { NewTaskClient } from "./taskNewClient";

export default function NewTaskPage() {
  const mockMode = ["1", "true", "TRUE", "yes", "YES"].includes(String(process.env.MOCK_DATA ?? ""));
  return (
    <AppShell headerRight={<Badge tone="slate">新建任务</Badge>}>
      <Suspense fallback={<NewTaskSkeleton />}>
        <NewTaskClient mockMode={mockMode} />
      </Suspense>
    </AppShell>
  );
}

function NewTaskSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="grid gap-4 md:grid-cols-12">
        <div className="card md:col-span-7">
          <div className="h-40 animate-pulse rounded-[var(--radius-lg)] bg-black/[0.04]" />
        </div>
        <div className="card md:col-span-5">
          <div className="h-40 animate-pulse rounded-[var(--radius-lg)] bg-black/[0.04]" />
        </div>
      </div>
    </div>
  );
}
