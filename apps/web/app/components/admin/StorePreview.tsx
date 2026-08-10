"use client";

import type { StoreColors } from "@/lib/store-config";
import type { HeroText, FooterCtaText, UspItem, FeaturedOverlay, EditorialBlock } from "@/types";

type Props = {
  hero: HeroText;
  footerCta: FooterCtaText;
  usp: UspItem[];
  colors: StoreColors;
  logoUrl?: string | null;
  heroImageUrl?: string | null;
  featuredOverlay: FeaturedOverlay;
  featuredImageUrl?: string | null;
  editorial1: EditorialBlock;
  editorialImage1Url?: string | null;
  editorial2: EditorialBlock;
  editorialImage2Url?: string | null;
};

export function StorePreview({
  hero,
  footerCta,
  usp,
  colors,
  logoUrl,
  heroImageUrl,
  featuredOverlay,
  featuredImageUrl,
  editorial1,
  editorialImage1Url,
  editorial2,
  editorialImage2Url,
}: Props) {
  // scoped CSS variables so they don't bleed into the admin UI
  const vars = {
    "--p-dark": colors["green-dark"],
    "--p-accent": colors.accent,
  } as React.CSSProperties;

  const featuredImg = featuredImageUrl ?? heroImageUrl ?? null;

  return (
    <div style={vars} className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-md">

      {/* browser chrome */}
      <div className="flex items-center gap-1.5 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        <div className="ml-2 flex-1 rounded-full bg-white border border-[var(--color-border)] px-3 py-0.5 text-[10px] text-[var(--color-muted)]">
          miascarpa.com
        </div>
        <span className="text-[10px] font-semibold text-[var(--color-muted)]">Live Preview</span>
      </div>

      {/* scrollable store content */}
      <div className="overflow-y-auto" style={{ maxHeight: "72vh" }}>

        {/* ── mini navbar ── */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-white px-4 py-2.5">
          {logoUrl ? (
            <img key={logoUrl} src={logoUrl} alt="logo" className="h-4 object-contain" />
          ) : (
            <span className="font-display text-[11px] text-[var(--color-text)]">Mia Scarpa</span>
          )}
          <div className="flex gap-2.5">
            {["Men", "Women", "About Us", "Contact"].map((l) => (
              <span key={l} className="text-[7px] font-semibold uppercase tracking-wider text-gray-400">{l}</span>
            ))}
          </div>
        </div>

        {/* ── mini hero (full-bleed dark, video/photo + explore button only) ── */}
        <div className="relative flex flex-col items-center justify-center overflow-hidden px-5 py-14 text-center" style={{ background: "var(--p-dark)" }}>
          {heroImageUrl && (
            <img key={heroImageUrl} src={heroImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
          )}
          <span className="relative inline-block border border-white/70 bg-black/10 px-3 py-1.5 text-[7px] font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
            {hero.cta1}
          </span>
        </div>

        {/* ── mini featured: photo + products ── */}
        <div className="grid grid-cols-2">
          <div className="relative aspect-square overflow-hidden bg-[var(--color-bg)]">
            {featuredImg && <img src={featuredImg} alt="" className="h-full w-full object-cover" />}
            <div className="absolute bottom-1.5 left-1.5 border border-white/20 bg-black/50 px-1.5 py-1">
              <p className="text-white/60 leading-none" style={{ fontSize: 5 }}>{featuredOverlay.label}</p>
              <p className="font-display leading-none text-white" style={{ fontSize: 7 }}>{featuredOverlay.year}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-px bg-[var(--color-border)]">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-[var(--color-bg)]" />
            ))}
          </div>
        </div>

        {/* ── mini USP bar (plain divided text) ── */}
        <div className="grid grid-cols-4 divide-x divide-[var(--color-border)] border-b border-[var(--color-border)] bg-white py-2.5">
          {usp.map((item, i) => (
            <div key={i} className="px-1 text-center">
              <p className="font-semibold uppercase text-[var(--color-text)]" style={{ fontSize: 6.5 }}>{item.label}</p>
              <p className="mt-0.5 leading-tight text-[var(--color-muted)]" style={{ fontSize: 5.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* ── mini editorial blocks ── */}
        {[
          { block: editorial1, img: editorialImage1Url, flip: false },
          { block: editorial2, img: editorialImage2Url, flip: true },
        ].map(({ block, img, flip }, i) => (
          <div key={i} className={`grid grid-cols-2 ${flip ? "" : ""}`}>
            {flip && (
              <div className="flex flex-col justify-center px-3 py-4">
                <p className="font-semibold uppercase tracking-widest text-[var(--color-muted)]" style={{ fontSize: 6 }}>{block.label}</p>
                <p className="font-display mt-1 leading-tight text-[var(--color-text)]" style={{ fontSize: 11 }}>{block.title}</p>
                <p className="mt-1 line-clamp-2 text-[var(--color-muted)]" style={{ fontSize: 6 }}>{block.desc}</p>
              </div>
            )}
            <div className="relative aspect-square overflow-hidden bg-[var(--color-bg)]">
              {img && <img src={img} alt="" className="h-full w-full object-cover" />}
            </div>
            {!flip && (
              <div className="flex flex-col justify-center px-3 py-4">
                <p className="font-semibold uppercase tracking-widest text-[var(--color-muted)]" style={{ fontSize: 6 }}>{block.label}</p>
                <p className="font-display mt-1 leading-tight text-[var(--color-text)]" style={{ fontSize: 11 }}>{block.title}</p>
                <p className="mt-1 line-clamp-2 text-[var(--color-muted)]" style={{ fontSize: 6 }}>{block.desc}</p>
              </div>
            )}
          </div>
        ))}

        {/* ── mini products grid ── */}
        <div className="bg-white px-5 py-5">
          <p className="font-semibold uppercase tracking-widest text-[var(--color-muted)]" style={{ fontSize: 7 }}>Collection</p>
          <p className="font-display mt-0.5 text-[var(--color-text)]" style={{ fontSize: 12 }}>Featured Shoes</p>
          <div className="mt-3 grid grid-cols-3 gap-px bg-[var(--color-border)]">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white">
                <div className="aspect-square bg-[var(--color-bg)]" />
                <div className="border-t border-[var(--color-border)] p-1.5">
                  <div className="h-1.5 w-3/4 rounded bg-[var(--color-border)]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── mini footer CTA ── */}
        <div className="px-5 py-6 text-center" style={{ background: "var(--p-dark)" }}>
          <p className="font-display leading-tight text-white" style={{ fontSize: 14 }}>
            {footerCta.title}
          </p>
          <p className="mt-1 line-clamp-1 text-white/60" style={{ fontSize: 7 }}>
            {footerCta.desc}
          </p>
          <span className="mt-2.5 inline-block bg-white px-3 py-1.5 font-semibold uppercase tracking-widest" style={{ fontSize: 7, color: "var(--p-dark)" }}>
            {footerCta.btn}
          </span>
        </div>

      </div>
    </div>
  );
}
