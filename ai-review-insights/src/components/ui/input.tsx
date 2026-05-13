import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, leftSlot, rightSlot, ...props },
  ref,
) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-2xl border border-[var(--stroke)] bg-white px-3.5 py-2.5",
        "shadow-[0_1px_0_rgba(15,23,42,0.03)] focus-within:border-[rgba(11,92,255,0.35)]",
        "focus-within:shadow-[0_1px_0_rgba(15,23,42,0.04),0_0_0_4px_rgba(11,92,255,0.10)]",
        className,
      )}
    >
      {leftSlot ? <span className="text-slate-400">{leftSlot}</span> : null}
      <input
        ref={ref}
        className={cn(
          "w-full bg-transparent text-[15px] text-[var(--text)] placeholder:text-slate-400",
          "outline-none",
        )}
        {...props}
      />
      {rightSlot ? <span className="text-slate-400">{rightSlot}</span> : null}
    </div>
  );
});

