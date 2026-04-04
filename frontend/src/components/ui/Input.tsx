import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-sm font-medium pb-2 text-gray-700 font-work-sans ml-1">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <input
            type={type}
            className={cn(
              "flex h-12 w-full rounded-lg border border-gray-100 bg-gray-50 px-5 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all font-work-sans",
              icon && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          {icon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-700 cursor-pointer">
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
