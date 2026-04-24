"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";

type ToastVariant = "success" | "error" | "info" | "warning";

type ToastMessage = {
  id: string;
  title?: string;
  description: string;
  variant: ToastVariant;
};

interface ToastContextValue {
  showToast: (toast: {
    title?: string;
    description: string;
    variant?: ToastVariant;
    duration?: number;
  }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((toast: {
    title?: string;
    description: string;
    variant?: ToastVariant;
    duration?: number;
  }) => {
    const id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
    const message: ToastMessage = {
      id,
      title: toast.title,
      description: toast.description,
      variant: toast.variant ?? "info",
    };

    setToasts((current) => [message, ...current]);

    const duration = toast.duration ?? 4000;
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, duration);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-6 top-6 z-[9999] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => {
          const Icon =
            toast.variant === "success"
              ? CheckCircle2
              : toast.variant === "error"
              ? XCircle
              : toast.variant === "warning"
              ? AlertTriangle
              : Info;

          return (
            <div
              key={toast.id}
              className={
                "group relative overflow-hidden rounded-md border bg-white p-4 shadow-xl shadow-gray-200/50 transition-all duration-300 animate-in slide-in-from-right-full " +
                (toast.variant === "success"
                  ? "border-emerald-100/50"
                  : toast.variant === "error"
                  ? "border-rose-100/50"
                  : toast.variant === "warning"
                  ? "border-amber-100/50"
                  : "border-gray-100")
              }
            >
              <div className="flex items-start gap-4">
                <div className={
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-md " +
                  (toast.variant === "success"
                    ? "bg-emerald-50 text-emerald-600"
                    : toast.variant === "error"
                    ? "bg-rose-50 text-rose-600"
                    : toast.variant === "warning"
                    ? "bg-amber-50 text-amber-600"
                    : "bg-blue-50 text-blue-600")
                }>
                  <Icon className="h-5 w-5" />
                </div>
                
                <div className="flex-1 pt-0.5">
                  <h3 className="text-[13px] font-semibold text-gray-900">
                    {toast.title || (toast.variant.charAt(0).toUpperCase() + toast.variant.slice(1))}
                  </h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-gray-600 font-medium">
                    {toast.description}
                  </p>
                </div>

                <button 
                  onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
