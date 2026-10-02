"use client";

import { motion } from "motion/react";

export function ScrollHint() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2"
    >
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="flex flex-col items-center gap-2 text-fg-tertiary"
      >
        <span className="text-xs font-bold uppercase tracking-[0.1em] font-mono">
          Scroll
        </span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 4v16m0 0l-6-6m6 6l6-6"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="butt"
            strokeLinejoin="miter"
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}
