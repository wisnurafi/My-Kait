"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Tooltip — solid surface, 1px strong border, mono micro text.
 * Shows on hover/focus. Supports top/bottom positioning.
 */
export function Tooltip({
  children,
  content,
  position = "top",
}: {
  children: React.ReactNode;
  content: string;
  position?: "top" | "bottom";
}) {
  const [show, setShow] = useState(false);
  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          className={cn(
            "absolute z-50 left-1/2 -translate-x-1/2",
            "px-3 py-2 font-mono text-[11px] leading-relaxed whitespace-nowrap",
            "bg-surface text-fg-secondary border border-border-strong rounded-lg shadow-md",
            "max-w-[260px] animate-fade-in pointer-events-none",
            position === "top" ? "bottom-full mb-2" : "top-full mt-2",
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
