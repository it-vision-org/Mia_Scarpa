import { DEFAULT_COLORS } from "@/lib/store-config";
import { getDeliveryFeeCents, getContactInfo } from "@/actions/storeConfigActions";
import { getStoreSettings } from "@/actions/storeSettingsActions";
import { StoreSettingsClient } from "@/components/admin/StoreSettingsClient";
import {
  DEFAULT_HERO,
  DEFAULT_FOOTER_CTA,
  DEFAULT_COLLECTION,
  DEFAULT_USPS,
  DEFAULT_FEATURED_OVERLAY,
  DEFAULT_EDITORIAL_1,
  DEFAULT_EDITORIAL_2,
} from "@/types";

export async function StoreSettingsContent() {
  const [deliveryFeeCents, contactInfo, settingsResult] = await Promise.all([
    getDeliveryFeeCents(),
    getContactInfo(),
    getStoreSettings(),
  ]);
  const settings = settingsResult.success ? settingsResult.data! : null;

  const hero = {
    cta1: settings?.heroCta1 ?? DEFAULT_HERO.cta1,
  };

  const colors = {
    accent: settings?.colorAccent ?? DEFAULT_COLORS.accent,
    "green-dark": settings?.colorGreenDark ?? DEFAULT_COLORS["green-dark"],
    green: settings?.colorGreen ?? DEFAULT_COLORS.green,
    "green-mid": settings?.colorGreenMid ?? DEFAULT_COLORS["green-mid"],
    "green-light": settings?.colorGreenLight ?? DEFAULT_COLORS["green-light"],
    "green-bright": settings?.colorGreenBright ?? DEFAULT_COLORS["green-bright"],
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

  const usps =
    settings && settings.usps.length > 0
      ? settings.usps.map((u) => ({ label: u.label, desc: u.desc }))
      : DEFAULT_USPS;

  const featuredOverlay = {
    label: settings?.featuredOverlayLabel ?? DEFAULT_FEATURED_OVERLAY.label,
    year: settings?.featuredOverlayYear ?? DEFAULT_FEATURED_OVERLAY.year,
    collection: settings?.featuredOverlayCollection ?? DEFAULT_FEATURED_OVERLAY.collection,
  };

  const editorial1 = {
    label: settings?.editorialLabel1 ?? DEFAULT_EDITORIAL_1.label,
    title: settings?.editorialTitle1 ?? DEFAULT_EDITORIAL_1.title,
    desc: settings?.editorialDesc1 ?? DEFAULT_EDITORIAL_1.desc,
  };

  const editorial2 = {
    label: settings?.editorialLabel2 ?? DEFAULT_EDITORIAL_2.label,
    title: settings?.editorialTitle2 ?? DEFAULT_EDITORIAL_2.title,
    desc: settings?.editorialDesc2 ?? DEFAULT_EDITORIAL_2.desc,
  };

  return (
    <StoreSettingsClient
      hero={hero}
      colors={colors}
      footerCta={footerCta}
      collection={collection}
      usps={usps}
      featuredOverlay={featuredOverlay}
      editorial1={editorial1}
      editorial2={editorial2}
      deliveryFeeCents={deliveryFeeCents}
      contactInfo={contactInfo}
      media={{
        logoUrl: settings?.logoUrl ?? null,
        heroImage: settings?.heroImage ?? null,
        videoUrl: settings?.videoUrl ?? null,
        shopCoverImage: settings?.shopCoverImage ?? null,
        menCoverImage: settings?.menCoverImage ?? null,
        womenCoverImage: settings?.womenCoverImage ?? null,
        featuredImage: settings?.featuredImage ?? null,
        editorialImage1: settings?.editorialImage1 ?? null,
        editorialImage2: settings?.editorialImage2 ?? null,
      }}
    />
  );
}
