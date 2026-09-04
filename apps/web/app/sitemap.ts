import type { MetadataRoute } from "next";
import { getCachedStoreSettings, getStaticSiteUrl } from "@/lib/seo";
import { getPublishedProducts, getCategories } from "@/actions/productActions";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settingsResult = await getCachedStoreSettings();
  const indexingEnabled = settingsResult.success
    ? (settingsResult.data?.seoIndexingEnabled ?? true)
    : true;
  if (!indexingEnabled) return [];

  const siteUrl = getStaticSiteUrl();

  const [productsResult, categoriesResult] = await Promise.all([
    getPublishedProducts(),
    getCategories(),
  ]);
  const products = productsResult.success ? (productsResult.data ?? []) : [];
  const categories = categoriesResult.success ? (categoriesResult.data ?? []) : [];

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/shop?gender=men`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/shop?gender=women`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/shop?gender=enfant`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Matches the canonical URL shop/page.tsx sets for a pure category filter.
  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${siteUrl}/shop?category=${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteUrl}/product/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
