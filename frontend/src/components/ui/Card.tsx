import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn("bg-white rounded-2xl border border-gray-100 p-8", className)}>
      {children}
    </div>
  );
}
