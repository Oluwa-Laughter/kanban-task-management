"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export function Modal({
  open,
  onClose,
  children,
  className,
  contentClassName,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        "fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-12 sm:items-center",
        className
      )}
    >
      <div
        className={cn(
          "w-full max-w-[480px] rounded-md bg-white p-6 sm:p-8 dark:bg-dark-grey",
          contentClassName
        )}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
