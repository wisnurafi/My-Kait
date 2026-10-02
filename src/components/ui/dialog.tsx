"use client";

/**
 * Neon Glass Dialog — animated modal (scale + fade, GPU only).
 * Usage:
 *   <Dialog open={open} onClose={() => setOpen(false)}>
 *     <DialogTitle>...</DialogTitle>
 *     <DialogBody>...</DialogBody>
 *     <DialogFooter>...</DialogFooter>
 *   </Dialog>
 */
import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Dialog({
  open,
  onClose,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  // Lock body scroll + Escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn(
              "relative w-full max-w-md glass !bg-surface-solid/95 shadow-[0_24px_80px_rgba(0,0,0,0.6)]",
              className,
            )}
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 p-1.5 rounded-lg text-fg-tertiary hover:text-fg hover:bg-surface-hover transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn("text-lg font-bold px-6 pt-6 pr-12", className)}>{children}</h3>;
}

export function DialogBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-6 py-4 text-sm text-fg-secondary", className)}>{children}</div>;
}

export function DialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-6 pb-6 pt-2 flex justify-end gap-3", className)}>{children}</div>
  );
}

/**
 * ConfirmDialog — ready-made delete/destructive confirmation.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  loading = false,
  danger = true,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  loading?: boolean;
  danger?: boolean;
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogBody>{message}</DialogBody>
      <DialogFooter>
        <button
          onClick={onClose}
          className="h-10 px-5 text-sm font-bold rounded-xl border border-border-ink bg-surface text-fg-secondary hover:text-fg hover:border-border-strong transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={
            danger
              ? "h-10 px-5 text-sm font-bold rounded-xl text-white bg-[linear-gradient(120deg,#f43f5e,#e11d48)] hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer"
              : "h-10 px-5 text-sm font-bold rounded-xl text-white bg-[linear-gradient(120deg,var(--accent-primary),var(--accent-secondary))] hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer"
          }
        >
          {loading ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            confirmLabel
          )}
        </button>
      </DialogFooter>
    </Dialog>
  );
}
