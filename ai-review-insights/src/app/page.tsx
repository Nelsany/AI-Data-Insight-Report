import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listTasks } from "@/lib/localStore";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <AppShell headerRight={<CreditsPill />}>
      <Dashboard />
    </AppShell>
  );
}

async function Dashboard() {
  const tasks = await listTasks();
  const recents = tasks.slice(0, 6);
  const published = tasks.find((t) => t.status === "已发布" && t.reportId) ?? tasks[0];
  const reportHref = published?.reportId ? `/reports/${published.reportId}` : "/reports/r_demo_perfume_001";

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="pb-6 pt-6 md:pb-10 md:pt-10">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/[0.14] bg-white/60 px-4 py-2 text-xs text-[var(--muted)]">
            <span className="inline-flex h-2 w-2 rounded-full bg-black" />
            淘宝 · 导入数据 · 洞察报告
          </div>
          <h1 className="font-display text-[42px] font-semibold leading-[1.05] tracking-tight text-[var(--text)] md:text-[64px]">
            评论洞察报告，
            <br />
            为业务而生
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-6 text-[var(--muted)] md:text-[16px]">
            上传你已导出的评论数据（CSV/XLSX/JSON），系统会自动提炼痛点与卖点，并生成一份可分享的单页报告。
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild variant="primary" size="lg">
              <Link href="/tasks/new">
                <Sparkles className="h-4 w-4" />
                新建任务
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href={reportHref} target="_blank">
                预览示例报告 <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Big preview board */}
      <section className="mx-auto max-w-6xl">
        <div className="card overflow-hidden border-black/[0.18] bg-white/75">
          <div className="border-b border-black/[0.10] px-7 py-6">
            <div className="text-[15px] font-semibold text-[var(--text)]">早上好，Acme 团队</div>
            <div className="mt-1 text-sm text-[var(--muted)]">你的最新评论洞察已经准备就绪，可直接分享给同事评审。</div>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-12">
            <div className="md:col-span-8">
              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard label="样本量" value={`${published?.stats?.comments ?? 2000} 条`} note="导入后按样本上限抽样" />
                <MetricCard
                  label="好评占比"
                  value={`${Math.round(((published?.stats?.ratingDist.good ?? 1320) / Math.max(1, published?.stats?.comments ?? 2000)) * 100)}%`}
                  note="4-5 星视为好评"
                />
                <MetricCard label="负面主题" value="留香 / 味道" note="痛点聚合后的高频主题" />
              </div>

              <div className="mt-5">
                <CardHeader
                  title="最近任务"
                  subtitle={recents.length ? "点击进入任务详情或打开报告链接。" : "还没有任务，先创建一个。"}
                  right={<Badge tone="slate">Recent</Badge>}
                />
                <CardBody>
                  <div className="space-y-2">
                    {recents.length ? (
                      recents.map((t) => (
                        <Link
                          key={t.id}
                          href={`/tasks/${t.id}`}
                          className="block rounded-2xl border border-black/[0.12] bg-white/60 px-4 py-3 transition hover:bg-white/80"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-[var(--text)]">
                                {t.category} · {t.keyword}
                              </div>
                              <div className="mt-0.5 truncate text-xs text-[var(--muted)]">{t.prompt}</div>
                            </div>
                            <Badge tone="slate">{t.status}</Badge>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-black/[0.16] p-6 text-sm text-[var(--muted)]">
                        从右上角「新建任务」开始吧。
                      </div>
                    )}
                  </div>
                </CardBody>
              </div>
            </div>

            <div className="md:col-span-4">
              <div className="rounded-[var(--radius-lg)] border border-black/[0.12] bg-white/65 p-5 shadow-[0_18px_44px_rgba(0,0,0,0.10)]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-[var(--text)]">示例预览</div>
                    <div className="mt-1 text-xs text-[var(--muted)]">打开报告，查看图表与证据引用</div>
                  </div>
                  <Badge tone="slate">Preview</Badge>
                </div>

                <div className="mt-4 space-y-3">
                  <MiniInsight title="留香不持久" percent={21} desc="通勤场景落差明显" />
                  <MiniInsight title="味道偏甜/晕香" percent={17} desc="甜腻、上头、刺鼻" />
                  <MiniInsight title="喷头漏液/按压不顺" percent={12} desc="漏液、喷雾不均" />
                </div>

                <Button asChild variant="primary" size="md" className="mt-5 w-full">
                  <Link href={reportHref} target="_blank">
                    打开报告 <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ExampleRow({ text, href }: { text: string; href: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-3 rounded-2xl border border-[var(--stroke)] bg-[var(--surface-2)] px-4 py-3 hover:border-[rgba(11,92,255,0.20)]"
    >
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-[var(--text)]">{text}</div>
        <div className="mt-0.5 text-xs text-[var(--muted)]">点击带入示例指令</div>
      </div>
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white ring-1 ring-[var(--stroke)] transition group-hover:ring-[rgba(11,92,255,0.25)]">
        <ArrowRight className="h-4 w-4 text-[var(--muted)]" />
      </span>
    </Link>
  );
}

function CreditsPill() {
  return (
    <div className="hidden items-center gap-2 rounded-full border border-black/[0.14] bg-white/60 px-4 py-2 text-sm text-[var(--muted)] md:flex">
      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-black shadow-[0_0_0_4px_rgba(0,0,0,0.08)]" />
      预览 · 虚拟数据
    </div>
  );
}

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-black/[0.12] bg-white/65 p-4">
      <div className="text-xs font-medium text-[var(--muted)]">{label}</div>
      <div className="mt-2 font-display text-2xl font-semibold tracking-tight text-[var(--text)]">{value}</div>
      <div className="mt-2 text-xs text-[var(--muted)]">{note}</div>
    </div>
  );
}

function MiniInsight({ title, percent, desc }: { title: string; percent: number; desc: string }) {
  return (
    <div className="rounded-2xl border border-black/[0.12] bg-white/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-[var(--text)]">{title}</div>
        <div className="rounded-full border border-black/[0.14] bg-white/70 px-2.5 py-1 text-[11px] text-[var(--muted)]">
          {percent}%
        </div>
      </div>
      <div className="mt-1 text-xs leading-5 text-[var(--muted)]">{desc}</div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/[0.06] ring-1 ring-black/[0.08]">
        <div className="h-full rounded-full bg-black" style={{ width: `${Math.max(6, Math.min(100, percent))}%` }} />
      </div>
    </div>
  );
}
