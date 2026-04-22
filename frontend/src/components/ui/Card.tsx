import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?:any;
}

export function Card({ children, className,onClick }: CardProps) {
  return (
    <div className={cn("bg-white rounded-2xl border border-gray-100 p-8", className)} onClick={onClick}>
      {children}
    </div>
  );
}
