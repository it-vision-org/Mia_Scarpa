"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Slides the shop catalogue down into place, just under the section divider.
 * Reveals a beat after mount (never depends on an observer, so it can't get
 * stuck hidden), then swaps to a plain <div> so the leftover transform can't
 * break the sticky filter sidebar.
 */
export function ShopCatalogReveal({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const [revealed, setRevealed] = useState(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (reduce) {
      setRevealed(true);
      setSettled(true);
      return;
    }
    const a = requestAnimationFrame(() => setRevealed(true));
    const b = setTimeout(() => setSettled(true), 1100);
    return () => {
      cancelAnimationFrame(a);
      clearTimeout(b);
    };
  }, [reduce]);

  if (settled) return <div>{children}</div>;

  return (
    <motion.div
      style={{ transformOrigin: "top" }}
      initial={{ opacity: 0, y: -32, scaleY: 0.96 }}
      animate={revealed ? { opacity: 1, y: 0, scaleY: 1 } : undefined}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
