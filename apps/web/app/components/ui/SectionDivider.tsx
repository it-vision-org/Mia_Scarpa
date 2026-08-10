"use client";

import { motion } from "framer-motion";

export function SectionDivider() {
  return (
    <div className="bg-white py-10">
      <div className="mx-auto flex max-w-6xl items-center justify-center px-6">
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
    </div>
  );
}
