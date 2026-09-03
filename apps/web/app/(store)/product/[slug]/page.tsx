import { cache } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { getProductBySlug } from "@/actions/productActions";
import { ProductDetail } from "@/components/store/ProductDetail";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getBaseUrl,
  getSiteIdentity,
  truncate,
  ogImages,
  productJsonLd,
  breadcrumbJsonLd,
  MAX_DESCRIPTION_LENGTH,
} from "@/lib/seo";

// Deduped across generateMetadata and the page render — same request, one DB query.
const getProduct = cache((slug: string) => getProductBySlug(slug));

function buildDescription(description: string | null, name: string, storeName: string): string {
  const text =
    description?.trim() ||
    `Découvrez ${name} chez ${storeName} — cuir de qualité, finitions soignées et confort au quotidien. Livraison rapide partout en Tunisie.`;
  return truncate(text, MAX_DESCRIPTION_LENGTH);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [result, baseUrl, identity] = await Promise.all([
    getProduct(slug),
    getBaseUrl(),
    getSiteIdentity(),
  ]);

  if (!result.success || !result.data) {
    return { title: "Produit introuvable" };
  }

  const product = result.data;
  const url = `${baseUrl}/product/${product.slug}`;
  const imageUrl =
    product.ogImage?.trim() || product.primaryImage || identity.seo.ogImage;
  const title = product.seoTitle?.trim() || product.name;
  const description =
    product.seoDescription?.trim() ||
    buildDescription(product.description, product.name, identity.storeName);
  const keywords = product.seoKeywords?.trim() || undefined;

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: identity.storeName,
      images: ogImages(imageUrl, title),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [result, baseUrl, identity] = await Promise.all([
    getProduct(slug),
    getBaseUrl(),
    getSiteIdentity(),
  ]);

  if (!result.success || !result.data) {
    notFound();
  }

  const product = result.data;
  const url = `${baseUrl}/product/${product.slug}`;

  const breadcrumbItems = [
    { name: "Accueil", url: `${baseUrl}/` },
    { name: "Boutique", url: `${baseUrl}/shop` },
    ...(product.category
      ? [{ name: product.category.name, url: `${baseUrl}/shop?category=${product.category.slug}` }]
      : []),
    { name: product.name },
  ];

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <JsonLd data={productJsonLd({ product, url, storeName: identity.storeName })} />
      <JsonLd data={breadcrumbJsonLd(breadcrumbItems)} />

      <Link
        href="/shop"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to shop
      </Link>

      <ProductDetail
        productId={product.id}
        productSlug={product.slug}
        productName={product.name}
        basePrice={product.basePrice}
        promo={{
          live: product.promoLive,
          effectivePrice: product.effectivePrice,
          image: product.promoImage,
          label: product.promoLabel,
          percent: product.promoPercent,
        }}
        description={product.description}
        categoryName={product.category?.name}
        colors={product.colors}
        mainImages={product.images.map((i) => i.url)}
      />
    </main>
  );
}
