import "./globals.css";
import type { Metadata } from "next";
import { DEFAULT_COLORS } from "@/lib/store-config";
import { getStoreSettings } from "@/actions/storeSettingsActions";
import {
  getSiteIdentity,
  getBaseUrl,
  getStaticSiteUrl,
  buildRobotsMeta,
  ogImages,
  organizationJsonLd,
  websiteJsonLd,
  DEFAULT_SITE_URL,
} from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { CartProvider } from "@/cart-context";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const [identity, baseUrl] = await Promise.all([getSiteIdentity(), getBaseUrl()]);

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL),
    title: { default: identity.seo.title, template: `%s — ${identity.storeName}` },
    description: identity.seo.description,
    keywords: identity.seo.keywords ?? undefined,
    robots: buildRobotsMeta(identity.indexingEnabled),
    alternates: { canonical: identity.seo.canonicalOverride || baseUrl },
    openGraph: {
      type: "website",
      title: identity.seo.ogTitle,
      description: identity.seo.ogDescription,
      url: baseUrl,
      siteName: identity.storeName,
      images: ogImages(identity.seo.ogImage),
    },
    twitter: {
      card: "summary_large_image",
      title: identity.seo.twitterTitle,
      description: identity.seo.twitterDescription,
      images: identity.seo.twitterImage ? [identity.seo.twitterImage] : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settingsResult, identity, locale] = await Promise.all([
    getStoreSettings(),
    getSiteIdentity(),
    getLocale(),
  ]);
  const settings = settingsResult.success ? settingsResult.data : null;
  const siteUrl = identity.seo.canonicalOverride || getStaticSiteUrl();
  const colors = {
    accent: settings?.colorAccent ?? DEFAULT_COLORS.accent,
    "green-dark": settings?.colorGreenDark ?? DEFAULT_COLORS["green-dark"],
    green: settings?.colorGreen ?? DEFAULT_COLORS.green,
    "green-mid": settings?.colorGreenMid ?? DEFAULT_COLORS["green-mid"],
    "green-light": settings?.colorGreenLight ?? DEFAULT_COLORS["green-light"],
    "green-bright": settings?.colorGreenBright ?? DEFAULT_COLORS["green-bright"],
  };
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body
        className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] antialiased"
        style={
          {
            "--color-accent": colors.accent,
            "--color-green-dark": colors["green-dark"],
            "--color-green": colors.green,
            "--color-green-mid": colors["green-mid"],
            "--color-green-light": colors["green-light"],
            "--color-green-bright": colors["green-bright"],
          } as React.CSSProperties
        }
      >
        <JsonLd data={organizationJsonLd(identity, siteUrl)} />
        <JsonLd data={websiteJsonLd({ url: siteUrl, storeName: identity.storeName })} />
        <NextIntlClientProvider>
          <CartProvider>{children}</CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
