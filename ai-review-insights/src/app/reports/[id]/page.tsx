import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EChart } from "@/components/charts/EChart";
import { getReport } from "@/lib/localStore";
import { ArrowLeft, ExternalLink, Sparkles } from "lucide-react";

export default async function ReportPage({ params }: { params: { id: string } }) {
  // Next.js 16：部分运行时 params 可能是 Promise，需要 await 解包
  const { id } = (await Promise.resolve(params)) as { id: string };
  const report = await getReport(id);
  if (!report) return notFound();

  const { good, neutral, bad } = report.overview.ratingDist;

  const ratingOption = {
    tooltip: { trigger: "item" },
    series: [
      {
        type: "pie",
        radius: ["55%", "82%"],
        label: { show: false },
        data: [
          { value: good, name: "好评", itemStyle: { color: "#10b981" } },
          { value: neutral, name: "中评", itemStyle: { color: "#f59e0b" } },
          { value: bad, name: "差评", itemStyle: { color: "#ef4444" } },
        ],
      },
    ],
  } as any;

  const painOption = {
    grid: { left: 8, right: 18, top: 14, bottom: 10, containLabel: true },
    xAxis: { type: "value", axisLabel: { formatter: "{value}%" } },
    yAxis: {
      type: "category",
      data: report.pains.map((p) => p.title).reverse(),
      axisLabel: { color: "rgba(15,23,42,0.72)" },
    },
    series: [
      {
        type: "bar",
        data: report.pains.map((p) => p.percent).reverse(),
        itemStyle: { borderRadius: 10, color: "#0b5cff" },
      },
    ],
  } as any;

  const highlightOption = {
    grid: { left: 8, right: 18, top: 14, bottom: 10, containLabel: true },
    xAxis: { type: "value", axisLabel: { formatter: "{value}%" } },
    yAxis: {
      type: "category",
      data: report.highlights.map((p) => p.title).reverse(),
      axisLabel: { color: "rgba(15,23,42,0.72)" },
    },
    series: [
      {
        type: "bar",
        data: report.highlights.map((p) => p.percent).reverse(),
        itemStyle: { borderRadius: 10, color: "#0ea5e9" },
      },
    ],
  } as any;

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-6 md:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-[var(--text)] shadow-[var(--shadow-sm)] ring-1 ring-[var(--stroke)]"
          >
            <ArrowLeft className="h-4 w-4" />
            返回工作台
          </Link>
          <Badge tone="blue">分享报告</Badge>
        </div>
        <div className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-[var(--muted)] shadow-[var(--shadow-sm)] ring-1 ring-[var(--stroke)] md:flex">
          <Sparkles className="h-4 w-4 text-[#0b5cff]" />
          AI 生成 · 含证据引用
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 pb-10 md:px-6">
        <section className="mb-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
            <Badge tone="slate">{report.overview.category}</Badge>
            <span>关键词「{report.overview.keyword}」</span>
            <span className="text-slate-300">/</span>
            <span>近 {report.overview.timeRangeMonths} 个月</span>
            <span className="text-slate-300">/</span>
            <span>样本 {report.overview.comments} 条（商品 {report.overview.products} 个）</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[var(--text)]">
            {report.title}
          </h1>
          <p className="mt-1 text-[15px] leading-6 text-[var(--muted)]">{report.subtitle}</p>
        </section>

        <div className="grid gap-4 md:grid-cols-12">
          <Card className="md:col-span-5">
            <CardHeader title="评价分布" subtitle="按导入的样本评分统计。" />
            <CardBody>
              <EChart option={ratingOption} className="h-56" />
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--surface-2)] px-3 py-2">
                  <div className="text-xs text-[var(--muted)]">好评</div>
                  <div className="mt-1 font-semibold text-emerald-700">{good}</div>
                </div>
                <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--surface-2)] px-3 py-2">
                  <div className="text-xs text-[var(--muted)]">中评</div>
                  <div className="mt-1 font-semibold text-amber-700">{neutral}</div>
                </div>
                <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--surface-2)] px-3 py-2">
                  <div className="text-xs text-[var(--muted)]">差评</div>
                  <div className="mt-1 font-semibold text-rose-700">{bad}</div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="md:col-span-7">
            <CardHeader
              title="摘要（3 条关键结论）"
              subtitle="用于快速对齐“应该先修什么 / 应该怎么讲”。"
              right={
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--stroke)] bg-white px-3 py-2 text-sm text-[var(--muted)]">
                  导出（后续）
                  <ExternalLink className="h-4 w-4 text-[var(--muted)]" />
                </span>
              }
            />
            <CardBody>
              <ol className="space-y-3">
                {report.keyFindings.map((k, i) => (
                  <li key={i} className="rounded-2xl border border-[var(--stroke)] bg-[var(--surface-2)] p-4">
                    <div className="text-sm font-semibold text-[var(--text)]">结论 {i + 1}</div>
                    <div className="mt-1 text-sm leading-6 text-[var(--muted)]">{k}</div>
                  </li>
                ))}
              </ol>
            </CardBody>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-12">
          <Card className="md:col-span-6">
            <CardHeader title="负面痛点 TOP10" subtitle="占比为主题在负面样本中的估算值。" />
            <CardBody>
              <EChart option={painOption} className="h-[360px]" />
              <TopicList topics={report.pains.slice(0, 6)} tone="blue" />
            </CardBody>
          </Card>

          <Card className="md:col-span-6">
            <CardHeader title="正面卖点 TOP10" subtitle="占比为主题在正面样本中的估算值。" />
            <CardBody>
              <EChart option={highlightOption} className="h-[360px]" />
              <TopicList topics={report.highlights.slice(0, 6)} tone="green" />
            </CardBody>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-12">
          <Card className="md:col-span-7">
            <CardHeader title="高频关键词" subtitle="用于快速生成内容/卖点话术与问题定位关键词。" />
            <CardBody>
              <div className="flex flex-wrap gap-2">
                {report.topWords.map((w) => (
                  <span
                    key={w.word}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--stroke)] bg-white px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-[var(--text)]">{w.word}</span>
                    <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-xs text-[var(--muted)]">
                      {w.count}
                    </span>
                  </span>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card className="md:col-span-5">
            <CardHeader title="方法说明 & 免责声明" subtitle="用于评审与对外分享的合规与可信度提示。" />
            <CardBody className="space-y-2 text-sm leading-6 text-[var(--muted)]">
              <p>• 本报告由系统基于你导入的评论样本进行聚合分析生成，结论仅供参考。</p>
              <p>• 首期不做任何平台爬虫/抓取；数据来源与导出过程由用户自行完成并负责合规。</p>
              <p>• 正式上线时建议补齐数据脱敏/审计日志/导入校验与质量评估，并增加导出与分享权限控制。</p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TopicList({
  topics,
  tone,
}: {
  topics: Array<{ title: string; percent: number; evidences: string[] }>;
  tone: "blue" | "green";
}) {
  const badgeTone = tone === "blue" ? "blue" : "green";
  return (
    <div className="mt-4 space-y-3">
      {topics.map((t) => (
        <details
          key={t.title}
          className="group rounded-3xl border border-[var(--stroke)] bg-[var(--surface-2)] px-4 py-3"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Badge tone={badgeTone as any}>{t.title}</Badge>
                <span className="text-sm text-[var(--muted)]">{t.percent}%</span>
              </div>
              <div className="mt-1 text-sm text-[var(--text)]">点击展开代表性原文证据</div>
            </div>
            <span className="rounded-full bg-white px-3 py-1.5 text-xs text-[var(--muted)] ring-1 ring-[var(--stroke)]">
              展开
            </span>
          </summary>
          <div className="mt-3 space-y-2">
            {t.evidences.slice(0, 4).map((e, idx) => (
              <div key={idx} className="rounded-2xl bg-white px-3 py-2 text-sm leading-6 text-[var(--text)]">
                {e}
              </div>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
