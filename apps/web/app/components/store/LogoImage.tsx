"use client";

import { useState } from "react";

export function LogoImage({
  height = 40,
  src,
  maxWidth,
}: {
  height?: number;
  src?: string | null;
  /** Optional hard cap on rendered width so a wide logo can't push adjacent nav items. */
  maxWidth?: number | string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span className="rounded-lg bg-[var(--color-green)] px-2.5 py-1 text-sm font-black tracking-wide text-white">
        FLEX
      </span>
    );
  }

  return (
    <img
      src={src}
      alt="Store logo"
      onError={() => setFailed(true)}
      style={{ maxHeight: height, width: "auto", maxWidth: maxWidth ?? "100%" }}
      className="object-contain object-left"
    />
  );
}
