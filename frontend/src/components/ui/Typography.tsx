import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TypographyProps {
  children: ReactNode;
  className?: string;
  variant?: "h1" | "h2" | "h3" | "body" | "caption" | "small";
}

export function Typography({ children, className, variant = "body" }: TypographyProps) {
  const variants = {
    h1: "font-dm-sans text-3xl font-semibold tracking-tight",
    h2: "font-dm-sans text-2xl font-semibold tracking-tight",
    h3: "font-dm-sans text-xl font-semibold tracking-tight",
    body: "font-work-sans text-base font-normal",
    caption: "font-work-sans text-sm font-normal text-gray-600",
    small: "font-work-sans text-xs font-normal text-gray-600",
  };

  const Component = variant.startsWith("h") ? (variant as any) : "p";

  return (
    <Component className={cn(variants[variant], className)}>
      {children}
    </Component>
  );
}
