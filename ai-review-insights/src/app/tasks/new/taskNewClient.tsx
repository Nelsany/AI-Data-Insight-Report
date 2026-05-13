"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Category, Task, TaskConfig } from "@/lib/types";
import { ChevronDown, Sparkles, Wand2 } from "lucide-react";

type Parsed = { category: Category; keyword: string; config: TaskConfig };

const categoryTones: Record<Category, "blue" | "amber" | "green"> = {
  香水: "blue",
  口红: "amber",
  面膜: "green",
};

export function NewTaskClient({ mockMode }: { mockMode?: boolean }) {
  const router = useRouter();
  const sp = useSearchParams();

  const preset = sp.get("p");
  const presetText =
    preset === "perfume"
      ? "分析淘宝香水评论，近3个月 2000 条，分析差评原因并生成报告"
      : preset === "lipstick"
        ? "分析口红评论，重点看掉色/拔干/色差的吐槽点，出一份报告"
        : preset === "mask"
          ? "分析面膜好评卖点：补水、服帖、温和，生成带图表的报告页"
          : "";

  const [prompt, setPrompt] = React.useState(presetText);
  const [parsed, setParsed] = React.useState<Parsed | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [dataFile, setDataFile] = React.useState<File | null>(null);

  React.useEffect(() => {
    if (presetText) void doParse(presetText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doParse(text: string) {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch("/api/parse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });
      if (!r.ok) throw new Error((await r.json()).error ?? "解析失败");
      const data = (await r.json()) as Parsed;
      setParsed(data);
    } catch (e: any) {
      setErr(e?.message ?? "解析失败");
      setParsed(null);
    } finally {
      setLoading(false);
    }
  }

  async function createTask() {
    if (mockMode) {
      setErr("当前为虚拟数据预览模式：不支持创建任务/上传文件/触发分析。请回到工作台打开示例任务与报告预览。");
      return;
    }
    if (!prompt.trim()) return;
    setCreating(true);
    setErr(null);
    try {
      const r = await fetch("/api/tasks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prompt,
          category: parsed?.category,
          keyword: parsed?.keyword,
          config: parsed?.config,
        }),
      });
      if (!r.ok) throw new Error((await r.json()).error ?? "创建失败");
      const data = (await r.json()) as { task: Task };

      // 上传数据文件（CSV/XLSX/JSON）
      if (dataFile) {
        const fd = new FormData();
        fd.append("file", dataFile);
        const up = await fetch(`/api/tasks/${data.task.id}/data`, { method: "POST", body: fd });
        if (!up.ok) throw new Error((await up.json()).error ?? "数据导入失败");
      } else {
        throw new Error("请先选择要导入的评论数据文件（CSV/XLSX/JSON）");
      }

      // 触发分析
      const run = await fetch(`/api/tasks/${data.task.id}/run`, { method: "POST" });
      if (!run.ok) throw new Error((await run.json()).error ?? "开始执行失败");

      router.push(`/tasks/${data.task.id}`);
    } catch (e: any) {
      setErr(e?.message ?? "创建失败");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="grid gap-4 md:grid-cols-12">
        <Card className="md:col-span-7">
          <CardHeader
            title="用自然语言描述你要做的事"
            subtitle="首期不做爬虫：请上传你已整理好的评论数据（CSV/XLSX/JSON），我们会自动识别类目并生成分析参数。"
          />
          <CardBody className="space-y-3">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={7}
              placeholder="例如：分析淘宝口红评论，近3个月 2000条，分析掉色/拔干/色差并出报告"
            />

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => void doParse(prompt)}
                disabled={mockMode || loading || !prompt.trim()}
              >
                <Wand2 className="h-4 w-4" />
                {mockMode ? "解析参数（不可用）" : loading ? "解析中…" : "AI 解析参数"}
              </Button>
              <Button
                variant="primary"
                onClick={() => void createTask()}
                disabled={mockMode || creating || !prompt.trim()}
              >
                <Sparkles className="h-4 w-4" />
                {mockMode ? "创建任务（不可用）" : creating ? "创建中…" : "创建任务"}
              </Button>
              {err ? <span className="text-sm text-rose-600">{err}</span> : null}
            </div>

            <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--surface-2)] px-4 py-3">
              <div className="mb-2 text-sm font-medium text-[var(--text)]">导入评论数据文件（必填）</div>
              <div className="text-sm text-[var(--muted)]">
                支持 CSV / XLSX / JSON。建议列名包含：内容(content/正文)、评分(rating/评分)、时间(date/时间)、追评(appendContent)、规格(sku)、点赞数(likeCount)、商品链接(productUrl)。
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Input
                  type="file"
                  accept=".csv,.tsv,.xlsx,.xls,.json"
                  onChange={(e) => setDataFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="md:col-span-5">
          <CardHeader
            title="解析结果（可编辑）"
            subtitle="当前为规则解析器：后续可替换为 LLM + JSON Schema 校验。"
            right={<Badge tone="slate">Preview</Badge>}
          />
          <CardBody className="space-y-3">
            <Field label="平台">
              <Badge tone="blue">淘宝</Badge>
            </Field>

            <Field label="类目">
              <CategorySelect
                value={parsed?.category ?? "香水"}
                onChange={(c) =>
                  setParsed((p) =>
                    p
                      ? { ...p, category: c }
                      : {
                          category: c,
                          keyword: c,
                          config: {
                            sampleSize: 2000,
                            timeRangeMonths: 3,
                            ratingFilter: "全部",
                            analysisFocus: "核心痛点与卖点",
                          },
                        },
                  )
                }
              />
            </Field>

            <Field label="关键词">
              <Input
                value={parsed?.keyword ?? ""}
                onChange={(e) => setParsed((p) => (p ? { ...p, keyword: e.target.value } : null))}
                placeholder="例如：Dior 香水"
              />
            </Field>

            <Field label="样本量（条）">
              <Input
                type="number"
                min={200}
                max={5000}
                value={parsed?.config.sampleSize ?? 2000}
                onChange={(e) =>
                  setParsed((p) =>
                    p ? { ...p, config: { ...p.config, sampleSize: Number(e.target.value || 0) } } : null,
                  )
                }
              />
            </Field>

            <Field label="时间范围（近 N 个月）">
              <Input
                type="number"
                min={1}
                max={12}
                value={parsed?.config.timeRangeMonths ?? 3}
                onChange={(e) =>
                  setParsed((p) =>
                    p
                      ? { ...p, config: { ...p.config, timeRangeMonths: Number(e.target.value || 0) } }
                      : null,
                  )
                }
              />
            </Field>

            <Field label="分析重点">
              <Input
                value={parsed?.config.analysisFocus ?? ""}
                onChange={(e) =>
                  setParsed((p) => (p ? { ...p, config: { ...p.config, analysisFocus: e.target.value } } : null))
                }
                placeholder="例如：差评原因/核心痛点"
              />
            </Field>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium text-[var(--muted)]">{label}</div>
      {children}
    </div>
  );
}

function CategorySelect({ value, onChange }: { value: Category; onChange: (c: Category) => void }) {
  const [open, setOpen] = React.useState(false);
  const options: Category[] = ["香水", "口红", "面膜"];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-2xl border border-[var(--stroke)] bg-white px-3.5 py-2.5 text-left text-[15px] shadow-[0_1px_0_rgba(15,23,42,0.03)]"
      >
        <span className="flex items-center gap-2">
          <Badge tone={categoryTones[value]}>{value}</Badge>
          <span className="text-sm text-[var(--muted)]">首期支持</span>
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-3xl border border-[var(--stroke)] bg-white shadow-[var(--shadow-md)]">
          {options.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                onChange(c);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-black/[0.03]"
            >
              <Badge tone={categoryTones[c]}>{c}</Badge>
              <span className="text-[var(--text)]">适配 {c} 的标签字典与报告模板</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
