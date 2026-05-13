"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Task } from "@/lib/types";
import { ArrowRight, FileText, Play, RefreshCw } from "lucide-react";

export function TaskDetailClient({ initialTask, mockMode }: { initialTask: Task; mockMode?: boolean }) {
  const [task, setTask] = React.useState<Task>(initialTask);
  const [running, setRunning] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function refresh() {
    if (mockMode) return;
    setRefreshing(true);
    setErr(null);
    try {
      const r = await fetch(`/api/tasks/${task.id}`, { cache: "no-store" });
      if (!r.ok) throw new Error((await r.json()).error ?? "刷新失败");
      const data = (await r.json()) as { task: Task };
      setTask(data.task);
    } catch (e: any) {
      setErr(e?.message ?? "刷新失败");
    } finally {
      setRefreshing(false);
    }
  }

  async function run() {
    if (mockMode) return;
    setRunning(true);
    setErr(null);
    try {
      const r = await fetch(`/api/tasks/${task.id}/run`, { method: "POST" });
      if (!r.ok) throw new Error((await r.json()).error ?? "执行失败");
      const data = (await r.json()) as { task: Task; reportId: string };
      setTask(data.task);
    } catch (e: any) {
      setErr(e?.message ?? "执行失败");
    } finally {
      setRunning(false);
    }
  }

  const published = task.status === "已发布" && !!task.reportId;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
            <Badge tone="blue">淘宝</Badge>
            <Badge tone="slate">{task.category}</Badge>
            <span className="truncate">关键词：{task.keyword}</span>
          </div>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-[var(--text)]">
            任务详情
          </h1>
          <p className="mt-1 max-w-3xl text-[15px] leading-6 text-[var(--muted)]">{task.prompt}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => void refresh()} disabled={refreshing || !!mockMode}>
            <RefreshCw className="h-4 w-4" />
            {mockMode ? "预览模式" : refreshing ? "刷新中…" : "刷新"}
          </Button>
          <Button variant="primary" onClick={() => void run()} disabled={running || !!mockMode}>
            <Play className="h-4 w-4" />
            {mockMode ? "开始分析（不可用）" : running ? "执行中…" : "开始分析"}
          </Button>
          {published ? (
            <Button asChild variant="secondary">
              <Link href={`/reports/${task.reportId}`} target="_blank">
                <FileText className="h-4 w-4" />
                打开报告
              </Link>
            </Button>
          ) : null}
        </div>
      </section>

      {err ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {err}
        </div>
      ) : null}

      {mockMode ? (
        <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--muted)]">
          这是前端“虚拟数据预览模式”。按钮已禁用，不会调用后端接口；你可以直接打开右上角的报告预览。
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-12">
        <Card className="md:col-span-7">
          <CardHeader title="三步流程" subtitle="导入数据 → 分析数据 → 产出报告" />
          <CardBody>
            <div className="space-y-4">
              <Step
                index={1}
                title="导入数据"
                desc="你已上传 CSV/XLSX/JSON 评论数据（首期不做爬虫）。"
                active={task.progress > 0}
                done={task.progress >= 35}
              />
              <Step
                index={2}
                title="分析数据"
                desc="按类目字典 + 主题聚合提炼痛点/卖点，并给出证据引用。"
                active={task.progress >= 35}
                done={task.progress >= 75}
              />
              <Step
                index={3}
                title="产出报告"
                desc="生成带图表的 HTML5 报告页，并给出可分享链接。"
                active={task.progress >= 75}
                done={task.progress >= 100}
                right={
                  published ? (
                    <Link href={`/reports/${task.reportId}`} target="_blank" className="text-sm font-medium text-[#0b5cff]">
                      查看报告 <ArrowRight className="ml-1 inline h-4 w-4" />
                    </Link>
                  ) : null
                }
              />

              <div className="pt-1">
                <div className="mb-2 flex items-center justify-between text-xs text-[var(--muted)]">
                  <span>整体进度</span>
                  <span>{task.progress}%</span>
                </div>
                <Progress value={task.progress} />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="md:col-span-5">
          <CardHeader title="运行日志" subtitle="用于排查导入/分析过程中的异常（首期为简化日志）。" />
          <CardBody>
            <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
              {task.logs
                .slice()
                .reverse()
                .map((l, idx) => (
                  <div
                    key={`${l.at}_${idx}`}
                    className="rounded-2xl border border-[var(--stroke)] bg-[var(--surface-2)] px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Badge tone={l.level === "error" ? "rose" : l.level === "warn" ? "amber" : "slate"}>
                        {l.level.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-[var(--muted-2)]">{new Date(l.at).toLocaleString()}</span>
                    </div>
                    <div className="mt-2 text-sm text-[var(--text)]">{l.message}</div>
                  </div>
                ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Step({
  index,
  title,
  desc,
  active,
  done,
  right,
}: {
  index: number;
  title: string;
  desc: string;
  active: boolean;
  done: boolean;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="pt-0.5">
        <div
          className={[
            "grid h-10 w-10 place-items-center rounded-2xl border",
            done
              ? "border-[rgba(16,185,129,0.22)] bg-[rgba(16,185,129,0.10)] text-emerald-700"
              : active
                ? "border-[rgba(11,92,255,0.22)] bg-[rgba(11,92,255,0.10)] text-[#0b5cff]"
                : "border-[var(--stroke)] bg-white text-[var(--muted)]",
          ].join(" ")}
        >
          <span className="text-sm font-semibold">{index}</span>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-[var(--text)]">{title}</div>
            <div className="mt-1 text-sm leading-6 text-[var(--muted)]">{desc}</div>
          </div>
          {right ? <div className="shrink-0 pt-0.5">{right}</div> : null}
        </div>
      </div>
    </div>
  );
}
