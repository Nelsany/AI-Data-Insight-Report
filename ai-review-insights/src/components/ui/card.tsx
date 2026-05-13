import { cn } from "@/lib/utils";

export function Card({
  className,
  hover = false,
  children,
}: {
  className?: string;
  hover?: boolean;
  children: React.ReactNode;
}) {
  return <section className={cn("card", hover ? "card-hover" : "", className)}>{children}</section>;
}

export function CardHeader({
  className,
  title,
  subtitle,
  right,
}: {
  className?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <header className={cn("flex items-start justify-between gap-4 p-6", className)}>
      <div className="min-w-0">
        <div className="text-[15px] font-semibold tracking-tight text-[var(--text)]">{title}</div>
        {subtitle ? <div className="mt-1 text-sm leading-6 text-[var(--muted)]">{subtitle}</div> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </header>
  );
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("px-6 pb-6", className)}>{children}</div>;
}
