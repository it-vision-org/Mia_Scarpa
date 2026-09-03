"use client";

import { useEffect, useRef, useState } from "react";
import Image, { type ImageProps } from "next/image";

/**
 * next/image wrapper: shows a shimmer placeholder until the image has decoded,
 * then fades it in. Resets on `src` change and can never get permanently
 * stuck — onLoad, onError, a cached-`complete` check and a timeout all clear it.
 */
export function ProductImage({ className = "", onLoad, onError, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  const src = props.src;

  useEffect(() => {
    setLoaded(false);

    // already in the browser cache — the load event may fire before React
    // attaches its listener, so check the DOM node directly
    const t0 = setTimeout(() => {
      if (ref.current?.complete && (ref.current.naturalWidth ?? 0) > 0) setLoaded(true);
    }, 0);

    // hard fallback: never leave a card shimmering forever
    const t1 = setTimeout(() => setLoaded(true), 2500);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
    };
  }, [src]);

  return (
    <>
      {!loaded && (
        <span aria-hidden className="img-shimmer pointer-events-none absolute inset-0 block" />
      )}
      <Image
        ref={ref}
        {...props}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        onError={(e) => {
          setLoaded(true);
          onError?.(e);
        }}
        className={`${className} transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </>
  );
}
