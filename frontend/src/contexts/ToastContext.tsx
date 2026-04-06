"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";

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
      <div className="fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
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
                "rounded-3xl border bg-white px-4 py-3 shadow-sm transition-all duration-200 " +
                (toast.variant === "success"
                  ? "border-emerald-100"
                  : toast.variant === "error"
                  ? "border-rose-100"
                  : toast.variant === "warning"
                  ? "border-amber-100"
                  : "border-slate-200")
              }
            >
              <div className="flex items-center gap-3">
                <span className={
                  "rounded-full p-2 " +
                  (toast.variant === "success"
                    ? "bg-emerald-50 text-emerald-600"
                    : toast.variant === "error"
                    ? "bg-rose-50 text-rose-600"
                    : toast.variant === "warning"
                    ? "bg-amber-50 text-amber-600"
                    : "bg-slate-100 text-slate-700")
                }>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  {toast.title ? (
                    <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
                  ) : null}
                  <p className="text-sm leading-5 text-slate-700">{toast.description}</p>
                </div>
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
