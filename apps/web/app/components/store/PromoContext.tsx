"use client";

import { createContext, useContext, type ReactNode } from "react";

const PromoBadgeContext = createContext<string | null>(null);

export function PromoBadgeProvider({
  image,
  children,
}: {
  image: string | null;
  children: ReactNode;
}) {
  return <PromoBadgeContext.Provider value={image}>{children}</PromoBadgeContext.Provider>;
}

/** Global default promotion image set in Website Settings (null if none). */
export const usePromoBadgeImage = () => useContext(PromoBadgeContext);
