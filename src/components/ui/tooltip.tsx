"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Cozy Cabin Tooltip — warm dark pill, cream text, soft shadow.
 * Shows on hover/focus. Positioned above or below the trigger.
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
            "px-3 py-1.5 text-xs font-medium leading-snug",
            "bg-[#2d2a26] text-[#faf7f2] rounded-lg shadow-lg",
            "dark:bg-[#faf7f2] dark:text-[#2d2a26]",
            "max-w-[260px] whitespace-normal text-center",
            "animate-fade-in pointer-events-none",
            position === "top" ? "bottom-full mb-2" : "top-full mt-2",
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
