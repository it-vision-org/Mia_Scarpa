import type { MetadataRoute } from "next";
import { getCachedStoreSettings, getStaticSiteUrl } from "@/lib/seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settingsResult = await getCachedStoreSettings();
  const indexingEnabled = settingsResult.success
    ? (settingsResult.data?.seoIndexingEnabled ?? true)
    : true;

  const siteUrl = getStaticSiteUrl();

  if (!indexingEnabled) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/account", "/api", "/cart", "/checkout"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
