"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Typography } from "@/components/ui/Typography";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className={cn(
          "w-full max-w-2xl bg-white rounded-2xl border border-gray-100 flex flex-col shadow-none animate-in zoom-in-95 duration-200 overflow-hidden",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50">
          {title ? (
            <Typography variant="h3" className="text-xl font-bold text-gray-900">{title}</Typography>
          ) : <div />}
          <button 
            onClick={onClose}
            className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8 scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  );
}
