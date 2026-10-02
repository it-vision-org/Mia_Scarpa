"use client";

import { useLayoutEffect, useRef, useState } from "react";

type UspItem = { label: string; desc: string };

function UspEntry({ item }: { item: UspItem }) {
  return (
    <div className="flex shrink-0 items-center gap-8 whitespace-nowrap px-8">
      <div className="text-center">
        <p className="text-base font-semibold uppercase tracking-wide text-[var(--color-text)] sm:text-lg">
          {item.label}
        </p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">{item.desc}</p>
      </div>
      <span className="text-[var(--color-border)]">•</span>
    </div>
  );
}

export function UspMarquee({ usp }: { usp: UspItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useLayoutEffect(() => {
    function measure() {
      if (!containerRef.current || !measureRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      const contentWidth = measureRef.current.scrollWidth;
      // only animate when the items don't fit the screen — a short list on a
      // wide viewport (e.g. 3 items on desktop) stays static, the same list
      // switches to the infinite ticker once it no longer fits (e.g. on mobile).
      setShouldAnimate(contentWidth > containerWidth);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [usp]);

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* invisible single-copy row, used only to measure natural content width */}
      <div
        ref={measureRef}
        aria-hidden="true"
        className="invisible absolute left-0 top-0 flex items-center"
      >
        {usp.map((item, i) => (
          <UspEntry key={i} item={item} />
        ))}
      </div>

      {shouldAnimate ? (
        <div className="[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="flex w-max animate-marquee items-center hover:[animation-play-state:paused]">
            {[...usp, ...usp].map((item, i) => (
              <UspEntry key={i} item={item} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          {usp.map((item, i) => (
            <UspEntry key={i} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
