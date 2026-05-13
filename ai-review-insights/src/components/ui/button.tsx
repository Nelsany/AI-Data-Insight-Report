import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
};

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium " +
  "transition-[transform,box-shadow,background,color,border-color] duration-150 ease-out " +
  "active:translate-y-[0.5px] disabled:pointer-events-none disabled:opacity-50 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/[0.18] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-white border border-black/[0.22] shadow-[0_14px_32px_rgba(0,0,0,0.14)] " +
    "hover:bg-black hover:shadow-[0_18px_44px_rgba(0,0,0,0.18)]",
  secondary:
    "bg-white/80 text-[var(--text)] border border-[var(--stroke-strong)] hover:bg-white " +
    "hover:shadow-[0_18px_38px_rgba(0,0,0,0.10)]",
  ghost: "bg-transparent text-[var(--text)] hover:bg-black/[0.04] border border-transparent",
  danger:
    "bg-[#ef4444] text-white shadow-[0_12px_22px_rgba(239,68,68,0.20)] hover:bg-[#dc2626]",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-sm",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "secondary", size = "md", asChild, children, ...props },
  ref,
) {
  const mergedClassName = cn(base, variants[variant], sizes[size], className);

  if (asChild) {
    // 让按钮样式可以“附着”在 <a>/<Link> 上，避免 <a><button/></a> 的无效嵌套导致怪异黑框/焦点样式
    if (!React.isValidElement(children)) {
      throw new Error("Button: asChild=true 时 children 必须是单个 React 元素（例如 <Link/>）");
    }
    return React.cloneElement(children as any, {
      className: cn(mergedClassName, (children as any).props?.className),
      ...props,
    });
  }

  return (
    <button
      ref={ref}
      className={mergedClassName}
      {...props}
    >
      {children}
    </button>
  );
});
