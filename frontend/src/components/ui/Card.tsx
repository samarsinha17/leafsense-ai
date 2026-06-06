import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div className={cn("glass-card rounded-2xl p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/50", className)} {...props}>
      {children}
    </div>
  );
}
