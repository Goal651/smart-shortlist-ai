"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Typography } from "@/components/ui/Typography";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Select({ options, value, onChange, placeholder = "Select...", className }: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-xl border border-gray-100 bg-white px-5 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary",
          isOpen && "ring-2 ring-primary/20 border-primary/20"
        )}
      >
        <Typography variant="body" className={cn("text-sm", !selectedOption && "text-gray-600")}>
          {selectedOption ? selectedOption.label : placeholder}
        </Typography>
        <ChevronDown className={cn("h-4 w-4 text-gray-600 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-14 left-0 z-50 w-full rounded-2xl border border-gray-100/50 bg-white p-2 shadow-2xl animate-in fade-in zoom-in duration-200">
          <div className="space-y-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex h-11 w-full items-center px-4 py-2 rounded-xl text-sm text-left",
                  option.value === value 
                    ? "bg-primary/5 text-primary font-medium" 
                    : "text-gray-600"
                )}
              >
                <div className="flex-1">
                    <Typography variant="body" className="truncate">{option.label}</Typography>
                </div>
                {option.value === value && <Check className="h-4 w-4 ml-2" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
