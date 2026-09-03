"use client";

import { motion } from "framer-motion";

export function SectionDivider({
  transparent = false,
  tail = false,
}: {
  transparent?: boolean;
  tail?: boolean;
}) {
  return (
    <div className={`${transparent ? "" : "bg-white"} py-10`}>
      <div className="mx-auto flex max-w-6xl flex-col items-center px-6">
        <div className="flex items-center justify-center">
          <motion.span
            className="h-px w-16 origin-right bg-[var(--color-border)] sm:w-24"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.span
            className="mx-4 h-1.5 w-1.5 bg-[var(--color-text)]"
            initial={{ rotate: 0, scale: 0, opacity: 0 }}
            whileInView={{ rotate: 45, scale: 1, opacity: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.25, delay: 0.22, ease: "easeOut" }}
          />
          <motion.span
            className="h-px w-16 origin-left bg-[var(--color-border)] sm:w-24"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        {tail && (
          <motion.span
            aria-hidden
            className="mt-3 block w-px origin-top bg-gradient-to-b from-[var(--color-text)] to-transparent"
            style={{ height: 40 }}
            initial={{ scaleY: 0, opacity: 0 }}
            whileInView={{ scaleY: 1, opacity: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
      </div>
    </div>
  );
}
