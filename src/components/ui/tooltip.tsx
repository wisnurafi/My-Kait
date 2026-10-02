"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Tooltip — solid surface, 1px strong border, mono micro text.
 */
export function Tooltip({
  children,
  content,
}: {
  children: React.ReactNode;
  content: string;
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
            "absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2",
            "px-3 py-2 font-mono text-[11px] leading-relaxed whitespace-nowrap",
            "bg-surface text-fg-secondary border border-border-strong rounded-lg shadow-md",
            "max-w-[260px]",
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
