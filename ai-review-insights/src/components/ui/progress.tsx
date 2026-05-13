import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
}: {
  value: number; // 0..100
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        "h-2.5 w-full overflow-hidden rounded-full bg-black/[0.06] ring-1 ring-black/[0.06]",
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))]"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

