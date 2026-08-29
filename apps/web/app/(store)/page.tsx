import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { getFeaturedProducts, getProductsByIds } from "@/actions/productActions";
import { ProductGrid } from "@/components/store/ProductGrid";
import { ProductTile } from "@/components/store/ProductTile";
import { AutoPlayVideo } from "@/components/store/AutoPlayVideo";
import { Reveal } from "@/components/ui/Reveal";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { getStoreSettings } from "@/actions/storeSettingsActions";
import {
  DEFAULT_HERO,
  DEFAULT_FOOTER_CTA,
  DEFAULT_COLLECTION,
  DEFAULT_USPS,
  DEFAULT_FEATURED_OVERLAY,
  DEFAULT_EDITORIAL_1,
  DEFAULT_EDITORIAL_2,
} from "@/types";

export default async function HomePage() {
  const [featured, settingsResult] = await Promise.all([
    getFeaturedProducts(),
    getStoreSettings(),
  ]);
  const products = featured.success ? (featured.data ?? []) : [];
  const settings = settingsResult.success ? settingsResult.data : null;

  const curatedIds = settings?.homepageFeaturedProductIds ?? [];
  const curatedResult = curatedIds.length > 0 ? await getProductsByIds(curatedIds) : null;
  const homepageFeatured =
    curatedResult?.success && (curatedResult.data?.length ?? 0) > 0
      ? curatedResult.data!
      : products.slice(0, 4);

  const hero = {
    cta1: settings?.heroCta1 ?? DEFAULT_HERO.cta1,
  };

  const footerCta = {
    title: settings?.footerCtaTitle ?? DEFAULT_FOOTER_CTA.title,
    desc: settings?.footerCtaDesc ?? DEFAULT_FOOTER_CTA.desc,
    btn: settings?.footerCtaBtn ?? DEFAULT_FOOTER_CTA.btn,
  };

  const collection = {
    label: settings?.collectionLabel ?? DEFAULT_COLLECTION.label,
    title: settings?.collectionTitle ?? DEFAULT_COLLECTION.title,
    desc: settings?.collectionDesc ?? DEFAULT_COLLECTION.desc,
  };

  const usp =
    settings && settings.usps.length > 0
      ? settings.usps.map((u) => ({ label: u.label, desc: u.desc }))
      : DEFAULT_USPS;

  const featuredOverlay = {
    label: settings?.featuredOverlayLabel ?? DEFAULT_FEATURED_OVERLAY.label,
    year: settings?.featuredOverlayYear ?? DEFAULT_FEATURED_OVERLAY.year,
    collection: settings?.featuredOverlayCollection ?? DEFAULT_FEATURED_OVERLAY.collection,
  };
  const featuredImage = settings?.featuredImage ?? settings?.heroImage ?? null;

  const editorial1 = {
    label: settings?.editorialLabel1 ?? DEFAULT_EDITORIAL_1.label,
    title: settings?.editorialTitle1 ?? DEFAULT_EDITORIAL_1.title,
    desc: settings?.editorialDesc1 ?? DEFAULT_EDITORIAL_1.desc,
    image: settings?.editorialImage1 ?? products[0]?.primaryImage ?? null,
  };
  const editorial2 = {
    label: settings?.editorialLabel2 ?? DEFAULT_EDITORIAL_2.label,
    title: settings?.editorialTitle2 ?? DEFAULT_EDITORIAL_2.title,
    desc: settings?.editorialDesc2 ?? DEFAULT_EDITORIAL_2.desc,
    image: settings?.editorialImage2 ?? products[1]?.primaryImage ?? null,
  };

  const videoUrl = settings?.videoUrl ?? null;
  const hasVideo = videoUrl !== null;

  return (
    <main>
      {/* ── HERO — FULL-SCREEN VIDEO ─────────────────────────────────── */}
      <section className="relative h-screen w-full overflow-hidden bg-[var(--color-green-dark)]">
        {hasVideo ? (
          <AutoPlayVideo
            src={videoUrl}
            controls={false}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : settings?.heroImage ? (
          <Image src={settings.heroImage} alt="" fill priority className="object-cover" />
        ) : null}

        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 border border-white/70 px-10 py-3.5 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-white hover:text-[var(--color-green-dark)]"
          >
            {hero.cta1}
          </Link>
        </div>
      </section>

      {/* ── DIVIDER ──────────────────────────────────────────────────── */}
      <SectionDivider />

      {/* ── FEATURED: IMAGE + PRODUCTS ───────────────────────────────── */}
      {homepageFeatured.length > 0 && (
        <section className="bg-white">
          <div className="w-full">
            <div className="grid grid-cols-1 gap-1 lg:h-[640px] lg:grid-cols-2">
              {/* left: image, fills the full half */}
              <Reveal className="h-full">
                <div className="relative h-[420px] w-full overflow-hidden bg-[var(--color-bg)] lg:h-full">
                  {featuredImage && (
                    <Image
                      src={featuredImage}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  )}
                  <div className="absolute bottom-4 left-4 border border-white/20 bg-black/50 px-4 py-2.5 backdrop-blur-sm">
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                      {featuredOverlay.label}
                    </p>
                    <p className="font-display text-base text-white">{featuredOverlay.year}</p>
                    {featuredOverlay.collection && (
                      <p className="text-xs text-white/70">{featuredOverlay.collection}</p>
                    )}
                  </div>
                </div>
              </Reveal>

              {/* right: 3-4 featured products, covering squares */}
              <Reveal delay={0.1} className="h-full">
                <div className="grid h-[420px] grid-cols-2 grid-rows-2 gap-1 lg:h-full">
                  {homepageFeatured.map((product) => (
                    <div key={product.id} className="relative h-full w-full">
                      <ProductTile product={product} />
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* ── USP BAR ──────────────────────────────────────────────────── */}
      <section className="border-y border-[var(--color-border)] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <Reveal className="grid grid-cols-2 divide-x divide-[var(--color-border)] md:grid-cols-4">
            {usp.map((item, i) => (
              <div key={i} className="px-4 text-center first:pl-0 last:pr-0">
                <p className="text-base font-semibold uppercase tracking-wide text-[var(--color-text)] sm:text-lg">{item.label}</p>
                <p className="mt-1.5 text-sm text-[var(--color-muted)]">{item.desc}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── EDITORIAL / CRAFTSMANSHIP ────────────────────────────────── */}
      {(editorial1.image || editorial2.image) && (
        <section className="bg-white">
          {editorial1.image && (
            <Reveal>
              <div className="grid grid-cols-1 items-center lg:grid-cols-2">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--color-bg)] lg:aspect-auto lg:h-[720px]">
                  <Image
                    src={editorial1.image}
                    alt={editorial1.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div className="px-6 py-12 lg:px-16 xl:px-20">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
                    {editorial1.label}
                  </p>
                  <h2 className="font-display mt-3 text-4xl text-[var(--color-text)] md:text-5xl">
                    {editorial1.title}
                  </h2>
                  <p className="mt-5 max-w-md text-base text-[var(--color-muted)]">{editorial1.desc}</p>
                </div>
              </div>
            </Reveal>
          )}

          {editorial2.image && (
            <Reveal>
              <div className="grid grid-cols-1 items-center lg:grid-cols-2">
                <div className="order-2 px-6 py-12 lg:order-1 lg:px-16 xl:px-20">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
                    {editorial2.label}
                  </p>
                  <h2 className="font-display mt-3 text-4xl text-[var(--color-text)] md:text-5xl">
                    {editorial2.title}
                  </h2>
                  <p className="mt-5 max-w-md text-base text-[var(--color-muted)]">{editorial2.desc}</p>
                </div>
                <div className="order-1 relative aspect-[4/5] w-full overflow-hidden bg-[var(--color-bg)] lg:order-2 lg:aspect-auto lg:h-[720px]">
                  <Image
                    src={editorial2.image}
                    alt={editorial2.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>
            </Reveal>
          )}
        </section>
      )}

      {/* ── PRODUCTS ─────────────────────────────────────────────────── */}
      <section className="border-t border-[var(--color-border)] py-20 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
                {collection.label}
              </p>
              <h2 className="font-display mt-1 text-3xl text-[var(--color-text)]">{collection.title}</h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{collection.desc}</p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--color-text)] transition hover:text-[var(--color-muted)]"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Reveal>
          <Reveal delay={0.1}>
            <ProductGrid products={products} />
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER CTA ───────────────────────────────────────────────── */}
      <section className="relative border-t border-[var(--color-border)] bg-[var(--color-green-dark)] py-24">
        <Reveal className="relative mx-auto max-w-xl px-6 text-center">
          <h2 className="font-display text-3xl text-white md:text-5xl">{footerCta.title}</h2>
          <p className="mt-4 text-white/60">{footerCta.desc}</p>
          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-2 bg-white px-10 py-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-green-dark)] transition hover:bg-white/90"
          >
            {footerCta.btn} <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
