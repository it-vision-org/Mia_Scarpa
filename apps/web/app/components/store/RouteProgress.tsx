"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ShoeLoader } from "./ShoeLoader";

/**
 * Global navigation feedback. React keeps stale content on screen during a
 * transition (so route-level loading.tsx doesn't fire for filter / search /
 * pagination changes) — this fills that gap: an instant top bar, and, if the
 * navigation is slow, the full shoe loader popup.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("Loading");

  const [active, setActive] = useState(false);
  const [popup, setPopup] = useState(false);
  const [exiting, setExiting] = useState(false);
  const popupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shownAtRef = useRef(0);

  const MIN_SHOW = 150; // tiny hold so a shown loader doesn't reverse with a flicker
  const EXIT_MS = 450; // fade/scale/blur-out duration

  useEffect(() => {
    function clearAll() {
      if (popupTimer.current) clearTimeout(popupTimer.current);
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
      if (exitTimer.current) clearTimeout(exitTimer.current);
      setActive(false);
      setPopup(false);
      setExiting(false);
    }

    function start(nextUrl?: string) {
      if (nextUrl) {
        try {
          const u = new URL(nextUrl, location.href);
          if (u.pathname === location.pathname && u.search === location.search) return;
        } catch {
          /* ignore */
        }
      }
      // Defer: history.pushState can be called from inside React's insertion
      // phase, where a synchronous setState throws
      // "useInsertionEffect must not schedule updates".
      queueMicrotask(() => {
        setActive(true);
        setExiting(false);
        setPopup(false);
        if (popupTimer.current) clearTimeout(popupTimer.current);
        if (exitTimer.current) clearTimeout(exitTimer.current);
        popupTimer.current = setTimeout(() => {
          shownAtRef.current = Date.now();
          setPopup(true);
        }, 300);
        // hard safety net — never let the loader hang if the navigation was
        // cancelled (e.g. a prevented click) so the "arrived" effect never runs
        if (safetyTimer.current) clearTimeout(safetyTimer.current);
        safetyTimer.current = setTimeout(clearAll, 8000);
      });
    }

    // Soft navigations that keep stale UI go through history.pushState.
    const origPush = history.pushState;
    history.pushState = function (this: History, ...args: Parameters<History["pushState"]>) {
      const ret = origPush.apply(this, args);
      start(typeof args[2] === "string" ? args[2] : undefined);
      return ret;
    };

    // Fire on the click too, for feedback before the RSC request even starts.
    // Bubble phase + defaultPrevented check so in-page buttons that live inside
    // a <Link> (image carousels, etc.) and cancel navigation don't trigger it.
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("button")) return;
      const a = target?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || a.hasAttribute("download") || a.target === "_blank") return;
      try {
        const u = new URL(a.href, location.href);
        if (u.origin !== location.origin) return;
        if (u.pathname === location.pathname && u.search === location.search) return;
      } catch {
        return;
      }
      start();
    }
    document.addEventListener("click", onClick);
    window.addEventListener("popstate", () => start());

    return () => {
      history.pushState = origPush;
      document.removeEventListener("click", onClick);
      if (popupTimer.current) clearTimeout(popupTimer.current);
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
    };
  }, []);

  // Arrived — the new route/params have committed.
  useEffect(() => {
    // a pending (not-yet-shown) popup: the nav was fast, just cancel it
    if (popupTimer.current) clearTimeout(popupTimer.current);
    if (safetyTimer.current) clearTimeout(safetyTimer.current);
    if (exitTimer.current) clearTimeout(exitTimer.current);
    setActive(false);

    setPopup((wasShowing) => {
      if (!wasShowing) return false;

      const finish = () => {
        setPopup(false);
        setExiting(false);
      };

      // hold the overlay over the freshly-committed page, wait for it to
      // actually paint (double rAF), THEN play the fade/scale/blur-out.
      const beginExit = () => {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            setExiting(true);
            exitTimer.current = setTimeout(finish, EXIT_MS);
          }),
        );
      };

      const heldFor = Date.now() - (shownAtRef.current || Date.now());
      const wait = Math.max(0, MIN_SHOW - heldFor);
      exitTimer.current = setTimeout(beginExit, wait);
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return (
    <>
      <div
        aria-hidden
        className={`pointer-events-none fixed left-0 top-0 z-[80] h-[3px] bg-[var(--color-text)] transition-[width,opacity] ${
          active ? "w-4/5 opacity-100 duration-[1200ms] ease-out" : "w-full opacity-0 duration-200"
        }`}
      />
      {popup && <ShoeLoader label={t("Default")} exiting={exiting} />}
    </>
  );
}
