import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";

export function AppShell({
  children,
  headerRight,
}: {
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-6 md:px-6">
        <Link href="/" className="group inline-flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-black text-white shadow-[0_18px_44px_rgba(0,0,0,0.18)]">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-[18px] font-semibold tracking-tight text-[var(--text)]">
              ReviewLens
            </span>
            <span className="block text-xs text-[var(--muted)]">评论洞察一体化</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-[var(--muted)] md:flex">
          <TopNavLink href="/">工作台</TopNavLink>
          <TopNavLink href="/tasks/new">新建任务</TopNavLink>
          <span className="cursor-not-allowed opacity-60">报告库</span>
          <span className="cursor-not-allowed opacity-60">关于</span>
        </nav>

        <div className="flex items-center gap-2">
          <Badge tone="slate" className="hidden md:inline-flex">
            淘宝 · 数据导入 · 香水/口红/面膜
          </Badge>
          {headerRight ? (
            <div className="shrink-0">{headerRight}</div>
          ) : (
            <Link
              href="/tasks/new"
              className={cn(
                "inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white",
                "border border-black/[0.22] shadow-[0_18px_44px_rgba(0,0,0,0.18)] hover:bg-black/90",
              )}
            >
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-10 md:px-6">{children}</main>
    </div>
  );
}

function TopNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-3 py-2 transition-colors",
        "hover:bg-white/60 hover:text-[var(--text)]",
      )}
    >
      {children}
    </Link>
  );
}
