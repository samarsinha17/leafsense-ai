import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
}

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "green-gradient text-white shadow-glow hover:scale-[1.03]",
        variant === "secondary" && "glass-card text-foreground hover:border-primary/70 hover:text-primary",
        variant === "ghost" && "text-muted hover:text-primary",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
