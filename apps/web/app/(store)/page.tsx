import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Phone, Mail, MapPin } from "lucide-react";

import { getBaseUrl } from "@/lib/seo";
import { getContactInfo } from "@/actions/storeConfigActions";
import { getFeaturedProducts, getProductsByIds } from "@/actions/productActions";
import { FeaturedCollectionGrid } from "@/components/store/FeaturedCollectionGrid";
import { FeaturedShoes } from "@/components/store/FeaturedShoes";
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

// Title / description / OG come from the root layout's global SEO settings — the
// home page IS the content those settings describe. Only the canonical URL is
// page-specific (self-referencing on the current host).
export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = await getBaseUrl();
  return { alternates: { canonical: `${baseUrl}/` } };
}

function telHref(phone: string): string | null {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits.replace(/\D/g, "").length >= 6 ? `tel:${digits}` : null;
}

export default async function HomePage() {
  const [featured, settingsResult, contact, tFooter] = await Promise.all([
    getFeaturedProducts(),
    getStoreSettings(),
    getContactInfo(),
    getTranslations("Footer"),
  ]);
  const products = featured.success ? (featured.data ?? []) : [];
  const settings = settingsResult.success ? settingsResult.data : null;

  const curatedIds = settings?.homepageFeaturedProductIds ?? [];
  const curatedResult = curatedIds.length > 0 ? await getProductsByIds(curatedIds) : null;
  const homepageFeatured =
    curatedResult?.success && (curatedResult.data?.length ?? 0) > 0
      ? curatedResult.data!
      : products;

  const hero = {
    cta1: settings?.heroCta1 ?? DEFAULT_HERO.cta1,
  };

  const footerCta = {
    title: settings?.footerCtaTitle ?? DEFAULT_FOOTER_CTA.title,
    desc: settings?.footerCtaDesc ?? DEFAULT_FOOTER_CTA.desc,
    btn: settings?.footerCtaBtn ?? DEFAULT_FOOTER_CTA.btn,
  };

  const phoneHref = telHref(contact.phone);

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
      {/* ── HERO ──────────────────────────────────────────────────────
          On mobile the video plays at its own natural size (no forced
          full-screen height, no cropping, no letterbox bars) — the section
          just wraps around it. From `sm:` up it goes back to the classic
          full-screen cropped background. The image fallback (no video set)
          always stays full-screen. */}
      <section
        className={`relative w-full overflow-hidden bg-[var(--color-green-dark)] ${
          hasVideo ? "sm:h-screen" : "h-screen"
        }`}
      >
        {hasVideo ? (
          <AutoPlayVideo
            src={videoUrl}
            controls={false}
            className="relative block h-auto w-full sm:absolute sm:inset-0 sm:h-full sm:object-cover"
          />
        ) : settings?.heroImage ? (
          <Image src={settings.heroImage} alt="" fill priority className="object-cover" />
        ) : null}

        <div className="absolute inset-0 bg-black/30" />

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
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
            <div className="grid grid-cols-1 gap-1 lg:grid-cols-2">
              {/* left: image — on lg it stretches to match however tall the
                  product grid on the right naturally comes out (square tiles,
                  so that's driven by content, not a fixed box) */}
              <Reveal>
                <div className="relative h-[280px] w-full overflow-hidden bg-[var(--color-bg)] sm:h-[360px] lg:h-full">
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

              {/* right: featured products — a square-tile grid up to 4, a
                  slider past that (see FeaturedShoes) */}
              <Reveal delay={0.1}>
                <FeaturedShoes products={homepageFeatured} />
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
            <FeaturedCollectionGrid products={products} />
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER CTA ───────────────────────────────────────────────── */}
      <section className="relative border-t border-[var(--color-border)] bg-[var(--color-green-dark)] py-24">
        <Reveal className="relative mx-auto max-w-xl px-6 text-center">
          <h2 className="font-display text-3xl text-white md:text-5xl">{footerCta.title}</h2>
          <p className="mt-4 text-white/60">{footerCta.desc}</p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-white px-10 py-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-green-dark)] transition hover:bg-white/90"
            >
              {footerCta.btn} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mx-auto mt-12 flex flex-col items-center gap-6 border-t border-white/15 pt-10 text-lg text-white/75 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:text-xl">
            <div className="flex flex-col items-center gap-4 sm:items-start">
              {phoneHref ? (
                <a href={phoneHref} className="inline-flex items-center gap-3 transition hover:text-white">
                  <Phone className="h-5 w-5 shrink-0" />
                  {contact.phone}
                </a>
              ) : (
                <span className="inline-flex items-center gap-3">
                  <Phone className="h-5 w-5 shrink-0" />
                  {contact.phone}
                </span>
              )}
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex items-center gap-3 transition hover:text-white"
                >
                  <Mail className="h-5 w-5 shrink-0" />
                  {contact.email}
                </a>
              )}
              <span className="inline-flex items-center gap-3">
                <MapPin className="h-5 w-5 shrink-0" />
                {contact.location}
              </span>
            </div>

            <div className="flex shrink-0 flex-col items-center gap-4 sm:flex-row sm:gap-6">
              <span
                aria-hidden
                className="h-px w-16 bg-white/15 sm:h-12 sm:w-px"
              />
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2.5 border border-transparent px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition-all duration-300 ease-out hover:border-white/40 hover:bg-white/10 hover:text-white"
              >
                {tFooter("GetInTouch")}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
