import type { ButtonHTMLAttributes, ReactNode } from "react";

type PillButtonProps = {
  children: ReactNode;
  variant?: "paper" | "coral" | "outline";
  size?: "md" | "lg" | "xl";
} & ButtonHTMLAttributes<HTMLButtonElement>;

const variantClasses: Record<NonNullable<PillButtonProps["variant"]>, string> = {
  paper: "bg-paper text-dark-900 shadow-[0_12px_32px_-6px_rgba(255,138,138,0.35)]",
  coral: "bg-coral text-dark-900 shadow-[0_12px_32px_-6px_rgba(255,138,138,0.45)]",
  outline: "border border-dark-600 text-paper bg-transparent",
};

const sizeClasses: Record<NonNullable<PillButtonProps["size"]>, string> = {
  md: "px-6 py-3 text-xs",
  lg: "px-9 py-5 text-sm",
  xl: "px-12 py-5 text-base",
};

export function PillButton({
  children,
  variant = "paper",
  size = "md",
  className = "",
  ...props
}: PillButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full font-mono tracking-[0.12em] uppercase transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
