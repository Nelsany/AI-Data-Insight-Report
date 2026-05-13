import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full resize-none rounded-3xl border border-[var(--stroke)] bg-white px-4 py-3",
        "text-[15px] leading-6 text-[var(--text)] placeholder:text-slate-400",
        "shadow-[0_1px_0_rgba(15,23,42,0.03)] outline-none",
        "focus:border-[rgba(11,92,255,0.35)] focus:shadow-[0_1px_0_rgba(15,23,42,0.04),0_0_0_4px_rgba(11,92,255,0.10)]",
        className,
      )}
      {...props}
    />
  );
});

