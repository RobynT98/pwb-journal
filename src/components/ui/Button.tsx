import React from "react";
import clsx from "clsx";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md";
  rounded?: "md" | "full";
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
};

export default function Button({
  className,
  variant = "outline",
  size = "md",
  rounded = "md",
  iconLeft,
  iconRight,
  children,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-medium transition shadow-sm",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2",
        rounded === "full" ? "rounded-full" : "rounded-xl",
        size === "sm" ? "h-9 px-3 text-sm" : "h-10 px-4",
        variant === "solid" && "bg-[var(--accent)] text-white hover:brightness-[.95] active:brightness-90",
        variant === "outline" && "border border-stone-300 bg-white hover:bg-stone-50 active:bg-stone-100",
        variant === "ghost" && "hover:bg-stone-100 active:bg-stone-200",
        className
      )}
    >
      {iconLeft && <span className="shrink-0">{iconLeft}</span>}
      {children}
      {iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
}