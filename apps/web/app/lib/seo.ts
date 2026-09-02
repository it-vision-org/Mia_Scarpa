import { cache } from "react";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { getStoreSettings } from "@/actions/storeSettingsActions";
import type { SerializedProduct } from "@/types";

// ─── Safe defaults ──────────────────────────────────────────────────────────
// Used whenever the admin has left the corresponding SEO setting empty.

export const DEFAULT_SITE_URL = "https://miascarpa.tn";
export const DEFAULT_STORE_NAME = "Mia Scarpa";
export const DEFAULT_SEO_TITLE =
  "Mia Scarpa — Chaussures en cuir pour homme et femme en Tunisie";
export const DEFAULT_SEO_DESCRIPTION =
  "Découvrez Mia Scarpa : chaussures en cuir pour homme et femme, alliant artisanat, élégance intemporelle et confort au quotidien. Livraison rapide partout en Tunisie.";
export const DEFAULT_SEO_KEYWORDS =
  "mia scarpa, chaussures cuir tunisie, chaussures homme tunisie, chaussures femme tunisie, souliers en cuir, bottines cuir, mocassins, sneakers cuir, chaussures élégantes tunisie";
export const MAX_TITLE_LENGTH = 60;
export const MAX_DESCRIPTION_LENGTH = 160;

// Deduped across generateMetadata + page render + layout, same request — one DB query.
export const getCachedStoreSettings = cache(() => getStoreSettings());

async function resolveHostAndProtocol() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const isLocalhost = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const protocol = headersList.get("x-forwarded-proto") ?? (isLocalhost ? "http" : "https");
  return { host, protocol };
}

/** Origin of the current request (protocol + host) — self-referencing canonical URLs. */
export async function getBaseUrl(): Promise<string> {
  const { host, protocol } = await resolveHostAndProtocol();
  return `${protocol}://${host}`;
}

/** Env-configured origin (no per-request host) — for sitemap.ts / robots.ts, which are cached. */
export function getStaticSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");
}

export function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max - 1).trimEnd()}…` : trimmed;
}

export function buildRobotsMeta(indexingEnabled: boolean): NonNullable<Metadata["robots"]> {
  return indexingEnabled ? { index: true, follow: true } : { index: false, follow: false };
}

export type SiteIdentity = {
  storeName: string;
  logo: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  indexingEnabled: boolean;
  seo: {
    title: string;
    description: string;
    keywords: string | null;
    canonicalOverride: string | null;
    ogTitle: string;
    ogDescription: string;
    ogImage: string | null;
    twitterTitle: string;
    twitterDescription: string;
    twitterImage: string | null;
  };
};

/** Global fallback chain: admin-set SEO settings → safe defaults. */
export async function getSiteIdentity(): Promise<SiteIdentity> {
  const result = await getCachedStoreSettings();
  const s = result.success ? result.data : undefined;

  const storeName = s?.orgName?.trim() || DEFAULT_STORE_NAME;
  const title = s?.seoTitle?.trim() || DEFAULT_SEO_TITLE;
  const description = s?.seoDescription?.trim() || DEFAULT_SEO_DESCRIPTION;
  // No static fallback asset in this project — fall back to the store logo, then nothing.
  const ogImage = s?.seoOgImage?.trim() || s?.logoUrl?.trim() || null;

  return {
    storeName,
    logo: s?.logoUrl || null,
    email: s?.contactEmail || null,
    phone: s?.contactPhone || null,
    address: s?.contactLocation || null,
    indexingEnabled: s?.seoIndexingEnabled ?? true,
    seo: {
      title,
      description,
      keywords: s?.seoKeywords?.trim() || DEFAULT_SEO_KEYWORDS,
      canonicalOverride: s?.seoCanonicalUrl?.trim() || null,
      ogTitle: s?.seoOgTitle?.trim() || title,
      ogDescription: s?.seoOgDescription?.trim() || description,
      ogImage,
      twitterTitle: s?.seoTwitterTitle?.trim() || title,
      twitterDescription: s?.seoTwitterDescription?.trim() || description,
      twitterImage: s?.seoTwitterImage?.trim() || ogImage,
    },
  };
}

/** Builds a Metadata.openGraph/twitter images array, or undefined when there's no image. */
export function ogImages(url: string | null, alt?: string) {
  if (!url) return undefined;
  return [{ url, width: 1200, height: 630, ...(alt ? { alt } : {}) }];
}

// ─── JSON-LD builders — real data only, nothing fabricated ───────────────────

export function organizationJsonLd(identity: SiteIdentity, url: string) {
  const { storeName, logo, email, phone, address } = identity;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: storeName,
    url,
    ...(logo && { logo }),
    ...(email && { email }),
    ...(phone && { telephone: phone }),
    ...(address && { address }),
  };
}

export function websiteJsonLd({ url, storeName }: { url: string; storeName: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: storeName,
    url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${url}/shop?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJsonLd({
  product,
  url,
  storeName,
}: {
  product: SerializedProduct;
  url: string;
  storeName: string;
}) {
  const images =
    product.images.length > 0
      ? product.images.map((i) => i.url)
      : product.primaryImage
        ? [product.primaryImage]
        : [];
  const totalStock = product.colors.reduce(
    (sum, c) => sum + c.sizes.reduce((s, sz) => s + sz.stock, 0),
    0,
  );

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(images.length > 0 && { image: images }),
    ...((product.seoDescription || product.description) && {
      description: product.seoDescription || product.description,
    }),
    sku: product.id,
    ...(product.category && { category: product.category.name }),
    brand: { "@type": "Brand", name: storeName },
    // Price on request (basePrice <= 0) has no real price to publish — omit the offer entirely.
    ...(product.basePrice > 0 && {
      offers: {
        "@type": "Offer",
        url,
        priceCurrency: "TND",
        price: product.basePrice.toFixed(3),
        availability: totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
      },
    }),
  };
}

export function breadcrumbJsonLd(items: { name: string; url?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      ...(item.url && { item: item.url }),
    })),
  };
}
