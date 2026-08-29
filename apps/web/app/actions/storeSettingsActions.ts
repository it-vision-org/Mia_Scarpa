"use server";

import { cache } from "react";
import { revalidatePath } from "next/cache";
import { db } from "@shoestore/db";
import type { ActionResult, ContactInfo, SerializedStoreSettings } from "@/types";

const DEFAULT_CONTACT: ContactInfo = {
  email: "contact@flexshoes.tn",
  phone: "+216 XX XXX XXX",
  location: "Tunisia",
  responseTime: "Within 24 hours",
};

// Store settings is a singleton row. `cache()` deduplicates concurrent calls
// within a single request (header, layout, and page all read settings), so
// only one of them can ever race to create the row — without this, each
// caller's own `findFirst` could miss the not-yet-committed row from another
// and create its own duplicate. `orderBy: id` keeps reads deterministic if a
// duplicate ever exists regardless.
const getOrCreate = cache(async () => {
  const existing = await db.storeSettings.findFirst({ orderBy: { id: "asc" } });
  if (existing) return existing;
  return db.storeSettings.create({ data: {} });
});

function serialize(s: any, usps: any[]): SerializedStoreSettings {
  return {
    id: s.id,
    logoUrl: s.logoUrl,
    heroImage: s.heroImage,
    heroCta1: s.heroCta1,
    colorAccent: s.colorAccent,
    colorGreenDark: s.colorGreenDark,
    colorGreen: s.colorGreen,
    colorGreenMid: s.colorGreenMid,
    colorGreenLight: s.colorGreenLight,
    colorGreenBright: s.colorGreenBright,
    videoUrl: s.videoUrl,
    shopCoverImage: s.shopCoverImage,
    menCoverImage: s.menCoverImage,
    womenCoverImage: s.womenCoverImage,
    featuredImage: s.featuredImage,
    featuredOverlayLabel: s.featuredOverlayLabel,
    featuredOverlayYear: s.featuredOverlayYear,
    featuredOverlayCollection: s.featuredOverlayCollection,
    editorialLabel1: s.editorialLabel1,
    editorialTitle1: s.editorialTitle1,
    editorialDesc1: s.editorialDesc1,
    editorialImage1: s.editorialImage1,
    editorialLabel2: s.editorialLabel2,
    editorialTitle2: s.editorialTitle2,
    editorialDesc2: s.editorialDesc2,
    editorialImage2: s.editorialImage2,
    collectionLabel: s.collectionLabel,
    collectionTitle: s.collectionTitle,
    collectionDesc: s.collectionDesc,
    footerCtaTitle: s.footerCtaTitle,
    footerCtaDesc: s.footerCtaDesc,
    footerCtaBtn: s.footerCtaBtn,
    deliveryFee: Number(s.deliveryFee),
    contactEmail: s.contactEmail,
    contactPhone: s.contactPhone,
    contactLocation: s.contactLocation,
    contactResponseTime: s.contactResponseTime,
    usps: usps.map((u) => ({ id: u.id, label: u.label, desc: u.desc, order: u.order })),
    homepageFeaturedProductIds: s.homepageFeaturedProductIds ?? [],
  };
}

export async function getStoreSettings(): Promise<ActionResult<SerializedStoreSettings>> {
  try {
    const settings = await getOrCreate();
    const usps = await db.storeUsp.findMany({
      where: { storeId: settings.id },
      orderBy: { order: "asc" },
    });
    return { success: true, data: serialize(settings, usps) };
  } catch (error) {
    console.error("[STORE SETTINGS] get error:", error);
    return { success: false, error: "Failed to load store settings" };
  }
}

export async function saveDeliveryFee(deliveryFee: number): Promise<ActionResult> {
  try {
    if (isNaN(deliveryFee) || deliveryFee < 0) {
      return { success: false, error: "Delivery fee must be a non-negative amount" };
    }
    const settings = await getOrCreate();
    await db.storeSettings.update({ where: { id: settings.id }, data: { deliveryFee } });
    revalidatePath("/", "layout");
    revalidatePath("/cart");
    revalidatePath("/checkout");
    return { success: true };
  } catch (error) {
    console.error("[STORE SETTINGS] saveDeliveryFee error:", error);
    return { success: false, error: "Failed to save delivery fee" };
  }
}

export async function saveLogoUrl(logoUrl: string): Promise<ActionResult> {
  try {
    const settings = await getOrCreate();
    await db.storeSettings.update({ where: { id: settings.id }, data: { logoUrl } });
    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (error) {
    console.error("[STORE SETTINGS] saveLogoUrl error:", error);
    return { success: false, error: "Failed to save logo" };
  }
}

export async function saveHeroSettings(data: {
  heroImage?: string | null;
  heroCta1?: string | null;
}): Promise<ActionResult> {
  try {
    const settings = await getOrCreate();
    await db.storeSettings.update({ where: { id: settings.id }, data });
    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (error) {
    console.error("[STORE SETTINGS] saveHero error:", error);
    return { success: false, error: "Failed to save" };
  }
}

export async function saveColorSettings(data: {
  colorAccent?: string | null;
  colorGreenDark?: string | null;
  colorGreen?: string | null;
  colorGreenMid?: string | null;
  colorGreenLight?: string | null;
  colorGreenBright?: string | null;
}): Promise<ActionResult> {
  try {
    const settings = await getOrCreate();
    await db.storeSettings.update({ where: { id: settings.id }, data });
    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (error) {
    console.error("[STORE SETTINGS] saveColors error:", error);
    return { success: false, error: "Failed to save" };
  }
}

export async function saveVideoSettings(data: {
  videoUrl?: string | null;
}): Promise<ActionResult> {
  try {
    const settings = await getOrCreate();
    await db.storeSettings.update({ where: { id: settings.id }, data });
    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (error) {
    console.error("[STORE SETTINGS] saveVideo error:", error);
    return { success: false, error: "Failed to save" };
  }
}

export async function saveShopCoverSettings(data: {
  shopCoverImage?: string | null;
  menCoverImage?: string | null;
  womenCoverImage?: string | null;
}): Promise<ActionResult> {
  try {
    const settings = await getOrCreate();
    await db.storeSettings.update({ where: { id: settings.id }, data });
    revalidatePath("/shop");
    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (error) {
    console.error("[STORE SETTINGS] saveShopCover error:", error);
    return { success: false, error: "Failed to save" };
  }
}

export async function saveFeaturedSettings(data: {
  featuredImage?: string | null;
  featuredOverlayLabel?: string | null;
  featuredOverlayYear?: string | null;
  featuredOverlayCollection?: string | null;
}): Promise<ActionResult> {
  try {
    const settings = await getOrCreate();
    await db.storeSettings.update({ where: { id: settings.id }, data });
    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (error) {
    console.error("[STORE SETTINGS] saveFeatured error:", error);
    return { success: false, error: "Failed to save" };
  }
}

export async function saveEditorialSettings(data: {
  editorialLabel1?: string | null;
  editorialTitle1?: string | null;
  editorialDesc1?: string | null;
  editorialImage1?: string | null;
  editorialLabel2?: string | null;
  editorialTitle2?: string | null;
  editorialDesc2?: string | null;
  editorialImage2?: string | null;
}): Promise<ActionResult> {
  try {
    const settings = await getOrCreate();
    await db.storeSettings.update({ where: { id: settings.id }, data });
    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (error) {
    console.error("[STORE SETTINGS] saveEditorial error:", error);
    return { success: false, error: "Failed to save" };
  }
}

export async function saveCollectionSettings(data: {
  collectionLabel?: string | null;
  collectionTitle?: string | null;
  collectionDesc?: string | null;
}): Promise<ActionResult> {
  try {
    const settings = await getOrCreate();
    await db.storeSettings.update({ where: { id: settings.id }, data });
    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (error) {
    console.error("[STORE SETTINGS] saveCollection error:", error);
    return { success: false, error: "Failed to save" };
  }
}

export async function saveFooterSettings(data: {
  footerCtaTitle?: string | null;
  footerCtaDesc?: string | null;
  footerCtaBtn?: string | null;
}): Promise<ActionResult> {
  try {
    const settings = await getOrCreate();
    await db.storeSettings.update({ where: { id: settings.id }, data });
    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (error) {
    console.error("[STORE SETTINGS] saveFooter error:", error);
    return { success: false, error: "Failed to save" };
  }
}

export async function saveUsps(
  items: { label: string; desc: string; order: number }[],
): Promise<ActionResult> {
  try {
    const settings = await getOrCreate();
    await db.storeUsp.deleteMany({ where: { storeId: settings.id } });
    await db.storeUsp.createMany({
      data: items.map((u) => ({ ...u, storeId: settings.id })),
    });
    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (error) {
    console.error("[STORE SETTINGS] saveUsps error:", error);
    return { success: false, error: "Failed to save" };
  }
}

export async function saveHomepageFeaturedProducts(productIds: string[]): Promise<ActionResult> {
  try {
    const settings = await getOrCreate();
    await db.storeSettings.update({
      where: { id: settings.id },
      data: { homepageFeaturedProductIds: productIds },
    });
    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (error) {
    console.error("[STORE SETTINGS] saveHomepageFeaturedProducts error:", error);
    return { success: false, error: "Failed to save" };
  }
}

export async function getDeliveryFee(): Promise<number> {
  try {
    const settings = await db.storeSettings.findFirst({ select: { deliveryFee: true } });
    return settings ? Number(settings.deliveryFee) : 0;
  } catch {
    return 0;
  }
}

export async function getContactInfo(): Promise<ContactInfo> {
  try {
    const settings = await db.storeSettings.findFirst({
      select: {
        contactEmail: true,
        contactPhone: true,
        contactLocation: true,
        contactResponseTime: true,
      },
    });
    if (!settings) return DEFAULT_CONTACT;
    return {
      email: settings.contactEmail?.trim() || DEFAULT_CONTACT.email,
      phone: settings.contactPhone?.trim() || DEFAULT_CONTACT.phone,
      location: settings.contactLocation?.trim() || DEFAULT_CONTACT.location,
      responseTime: settings.contactResponseTime?.trim() || DEFAULT_CONTACT.responseTime,
    };
  } catch {
    return DEFAULT_CONTACT;
  }
}

export async function saveContactInfo(data: {
  email: string;
  phone: string;
  location: string;
  responseTime: string;
}): Promise<ActionResult> {
  try {
    const email = data.email.trim();
    const phone = data.phone.trim();
    const location = data.location.trim();
    const responseTime = data.responseTime.trim();

    if (!email || !phone || !location) {
      return { success: false, error: "Email, phone, and location are required" };
    }

    const settings = await getOrCreate();
    await db.storeSettings.update({
      where: { id: settings.id },
      data: {
        contactEmail: email,
        contactPhone: phone,
        contactLocation: location,
        contactResponseTime: responseTime || DEFAULT_CONTACT.responseTime,
      },
    });
    revalidatePath("/contact");
    return { success: true };
  } catch (error) {
    console.error("[STORE SETTINGS] saveContactInfo error:", error);
    return { success: false, error: "Failed to save contact info" };
  }
}
