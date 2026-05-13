import { cn } from "@/lib/utils";

type Tone = "blue" | "slate" | "green" | "amber" | "rose";

const toneMap: Record<Tone, string> = {
  blue: "bg-white/70 text-[var(--text)] border-[var(--stroke)]",
  slate: "bg-white/60 text-[var(--muted)] border-[var(--stroke)]",
  green: "bg-white/70 text-[var(--text)] border-[var(--stroke)]",
  amber: "bg-white/70 text-[var(--text)] border-[var(--stroke)]",
  rose: "bg-white/70 text-[var(--text)] border-[var(--stroke)]",
};

export function Badge({
  children,
  tone = "slate",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-medium tracking-wide",
        toneMap[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
