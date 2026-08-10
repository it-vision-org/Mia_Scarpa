"use client";

import { useState, useTransition } from "react";
import { RotateCcw, Loader2, Play } from "lucide-react";
import type { StoreColors } from "@/lib/store-config";
import type {
  HeroText,
  FooterCtaText,
  CollectionText,
  UspItem,
  ContactInfo,
  FeaturedOverlay,
  EditorialBlock,
} from "@/types";
import { resetToDefault } from "@/actions/storeConfigActions";
import { HeroTextEditor } from "./HeroTextEditor";
import { FooterCtaEditor } from "./VideoTextEditor";
import { CollectionTextEditor } from "./CollectionTextEditor";
import { UspEditor } from "./UspEditor";
import { ColorEditor } from "./ColorEditor";
import { DeliveryFeeEditor, DeliveryFeeMiniPreview } from "./DeliveryFeeEditor";
import { ContactInfoEditor, ContactInfoMiniPreview } from "./ContactInfoEditor";
import { HeroPhotoUpload } from "./HeroPhotoUpload";
import { ShopCoverUpload } from "./ShopCoverUpload";
import { FeaturedPhotoUpload } from "./FeaturedPhotoUpload";
import { EditorialBlockEditor } from "./EditorialBlockEditor";
import { VideoUpload } from "./VideoUpload";
import { LogoUpload } from "./LogoUpload";
import { StorePreview } from "./StorePreview";

type StoreMedia = {
  logoUrl: string | null;
  heroImage: string | null;
  videoUrl: string | null;
  shopCoverImage: string | null;
  menCoverImage: string | null;
  womenCoverImage: string | null;
  featuredImage: string | null;
  editorialImage1: string | null;
  editorialImage2: string | null;
};

// ── Reset bar ──────────────────────────────────────────────────────────────

function ResetButton() {
  const [pending, startTransition] = useTransition();
  const [confirmed, setConfirmed] = useState(false);

  function handleClick() {
    if (!confirmed) {
      setConfirmed(true);
      setTimeout(() => setConfirmed(false), 3000);
      return;
    }
    startTransition(async () => {
      await resetToDefault();
      window.location.reload();
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleClick}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
        confirmed
          ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
          : "border-[var(--color-border)] bg-white text-[var(--color-muted)] hover:border-red-200 hover:text-red-600"
      }`}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
      {pending ? "Resetting…" : confirmed ? "Click again to confirm reset" : "Reset to Default"}
    </button>
  );
}

// ── Row layout: editor left, mini preview right ────────────────────────────

function EditRow({
  title,
  desc,
  editor,
  preview,
}: {
  title: string;
  desc: string;
  editor: React.ReactNode;
  preview: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
      {/* editor card */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-[var(--color-text)]">{title}</h2>
        <p className="mb-5 mt-0.5 text-sm text-[var(--color-muted)]">{desc}</p>
        {editor}
      </div>
      {/* mini preview */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">Preview</p>
        <div className="flex-1">{preview}</div>
      </div>
    </div>
  );
}

// ── Mini preview components ────────────────────────────────────────────────

function HeroMiniPreview({
  hero,
  colors,
  heroImageUrl,
}: {
  hero: HeroText;
  colors: StoreColors;
  heroImageUrl?: string | null;
}) {
  const vars = { "--p-dark": colors["green-dark"] } as React.CSSProperties;

  return (
    <div
      style={vars}
      className="overflow-hidden rounded-2xl border border-[var(--color-border)] shadow-sm"
    >
      <div
        className="relative flex items-center justify-center overflow-hidden p-6"
        style={{ background: "var(--p-dark)", aspectRatio: "16/10" }}
      >
        {heroImageUrl && (
          <img
            key={heroImageUrl}
            src={heroImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
        )}
        <span
          className="relative inline-flex items-center border border-white/70 font-semibold uppercase tracking-wide text-white"
          style={{ fontSize: 8, padding: "5px 14px" }}
        >
          {hero.cta1}
        </span>
      </div>
    </div>
  );
}



function VideoMiniPreview({ colors }: { colors: StoreColors }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-sm">
      <p className="mb-3 text-center font-semibold uppercase tracking-widest text-[var(--color-muted)]" style={{ fontSize: 8 }}>
        Hero background video
      </p>
      <div
        className="flex items-center justify-center border border-[var(--color-border)] bg-white"
        style={{ aspectRatio: "16/9" }}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: colors["green-dark"] }}>
          <Play className="ml-0.5 h-4 w-4 fill-white text-white" />
        </div>
      </div>
    </div>
  );
}

function FooterMiniPreview({ footerCta, colors }: { footerCta: FooterCtaText; colors: StoreColors }) {
  return (
    <div
      className="overflow-hidden p-5 text-center shadow-sm"
      style={{ background: colors["green-dark"] }}
    >
      <p className="font-display leading-tight text-white" style={{ fontSize: 15 }}>
        {footerCta.title}
      </p>
      <p className="mt-1 line-clamp-2 text-white/60" style={{ fontSize: 8, lineHeight: 1.4 }}>
        {footerCta.desc}
      </p>
      <span
        className="mt-3 inline-block bg-white font-semibold uppercase tracking-wide"
        style={{ fontSize: 8, padding: "5px 14px", color: colors["green-dark"] }}
      >
        {footerCta.btn}
      </span>
    </div>
  );
}

function CollectionMiniPreview({ collection, colors }: { collection: CollectionText; colors: StoreColors }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">
      <div className="p-4">
        <p className="font-semibold uppercase tracking-widest text-[var(--color-muted)]" style={{ fontSize: 8 }}>
          {collection.label}
        </p>
        <p className="font-display mt-0.5 leading-tight text-[var(--color-text)]" style={{ fontSize: 13 }}>
          {collection.title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-[var(--color-muted)]" style={{ fontSize: 8, lineHeight: 1.4 }}>
          {collection.desc}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-px bg-[var(--color-border)] px-4 pb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-square bg-[var(--color-bg)]" />
        ))}
      </div>
    </div>
  );
}

function FeaturedMiniPreview({ overlay, imageUrl }: { overlay: FeaturedOverlay; imageUrl: string | null }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">
      <div className="relative" style={{ aspectRatio: "4/5" }}>
        {imageUrl ? (
          <img key={imageUrl} src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-[var(--color-bg)] text-[10px] text-[var(--color-muted)]">
            No photo — falls back to hero photo
          </div>
        )}
        <div className="absolute bottom-2 left-2 rounded-md border border-white/20 bg-black/40 px-1.5 py-1 backdrop-blur-sm">
          <p className="text-white/60 leading-none" style={{ fontSize: 5 }}>{overlay.label}</p>
          <p className="font-black text-white leading-none" style={{ fontSize: 7 }}>{overlay.year}</p>
        </div>
      </div>
    </div>
  );
}

function EditorialMiniPreview({ block, imageUrl }: { block: EditorialBlock; imageUrl: string | null }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">
      <div className="relative" style={{ aspectRatio: "4/5" }}>
        {imageUrl ? (
          <img key={imageUrl} src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-[var(--color-bg)] text-[10px] text-[var(--color-muted)]">
            No photo — falls back to a featured product
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="font-bold uppercase tracking-widest text-[var(--color-muted)]" style={{ fontSize: 7 }}>{block.label}</p>
        <p className="mt-0.5 font-bold leading-tight text-[var(--color-text)]" style={{ fontSize: 11 }}>{block.title}</p>
        <p className="mt-0.5 line-clamp-2 text-[var(--color-muted)]" style={{ fontSize: 7, lineHeight: 1.4 }}>{block.desc}</p>
      </div>
    </div>
  );
}

function UspMiniPreview({ usps }: { usps: UspItem[]; colors: StoreColors }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
      <div className="grid grid-cols-2 divide-x divide-[var(--color-border)]">
        {usps.map((item, i) => (
          <div key={i} className="px-2 text-center first:pl-0 last:pr-0">
            <p className="font-semibold uppercase text-[var(--color-text)]" style={{ fontSize: 8 }}>{item.label}</p>
            <p className="mt-0.5 text-[var(--color-muted)]" style={{ fontSize: 7 }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ColorMiniPreview({ colors }: { colors: StoreColors }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] shadow-sm">
      {/* gradient strip */}
      <div
        className="h-16"
        style={{ background: `linear-gradient(135deg, ${colors["green-dark"]}, ${colors.green}, ${colors["green-mid"]}, ${colors["green-bright"]})` }}
      />
      {/* sample UI elements */}
      <div className="space-y-2 bg-white p-3">
        <div className="flex gap-2">
          <span className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: colors.accent }}>
            Button
          </span>
          <span className="rounded-full border px-3 py-1 text-xs font-semibold" style={{ borderColor: colors.accent, color: colors.accent }}>
            Outline
          </span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(Object.entries(colors) as [string, string][]).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full border border-gray-100 shadow-sm" style={{ backgroundColor: v }} />
              <span className="text-[9px] text-gray-400">{k}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LogoMiniPreview({ url }: { url: string | null }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">
      <div className="border-b border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
        <p className="text-xs font-semibold text-[var(--color-muted)]">Navbar preview</p>
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        {url ? (
          <img key={url} src={url} alt="Logo" className="h-8 object-contain" />
        ) : (
          <span className="font-display text-sm text-[var(--color-text)]">Mia Scarpa</span>
        )}
        <div className="flex gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">Men</span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">Women</span>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function StoreSettingsClient({
  hero,
  colors,
  footerCta,
  collection,
  usps,
  featuredOverlay,
  editorial1,
  editorial2,
  deliveryFeeCents,
  contactInfo,
  media,
}: {
  hero: HeroText;
  colors: StoreColors;
  footerCta: FooterCtaText;
  collection: CollectionText;
  usps: UspItem[];
  featuredOverlay: FeaturedOverlay;
  editorial1: EditorialBlock;
  editorial2: EditorialBlock;
  deliveryFeeCents: number;
  contactInfo: ContactInfo;
  media: StoreMedia;
}) {
  const [heroPreview, setHeroPreview]         = useState(hero);
  const [footerPreview, setFooterPreview]     = useState(footerCta);
  const [collectionPreview, setCollectionPreview] = useState(collection);
  const [uspsPreview, setUspsPreview]         = useState(usps);
  const [colorPreview, setColorPreview]       = useState<StoreColors>(colors);
  const [deliveryFeePreview, setDeliveryFeePreview] = useState(deliveryFeeCents);
  const [contactPreview, setContactPreview]   = useState(contactInfo);
  const [logoUrl, setLogoUrl]                 = useState(media.logoUrl);
  const [heroImageUrl, setHeroImageUrl]       = useState(media.heroImage);
  const [shopCoverUrl, setShopCoverUrl]       = useState(media.shopCoverImage);
  const [menCoverUrl, setMenCoverUrl]         = useState(media.menCoverImage);
  const [womenCoverUrl, setWomenCoverUrl]     = useState(media.womenCoverImage);
  const [featuredOverlayPreview, setFeaturedOverlayPreview] = useState(featuredOverlay);
  const [featuredImageUrl, setFeaturedImageUrl] = useState(media.featuredImage);
  const [editorial1Preview, setEditorial1Preview] = useState(editorial1);
  const [editorialImage1Url, setEditorialImage1Url] = useState(media.editorialImage1);
  const [editorial2Preview, setEditorial2Preview] = useState(editorial2);
  const [editorialImage2Url, setEditorialImage2Url] = useState(media.editorialImage2);

  return (
    <div className="space-y-8">
      {/* reset bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-white px-5 py-4 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)]">Reset store content</p>
          <p className="text-xs text-[var(--color-muted)]">
            Restores all text and colors to their original defaults. Photos and videos are kept.
          </p>
        </div>
        <ResetButton />
      </div>

      {/* Logo */}
      <EditRow
        title="🖼️ Store Logo"
        desc="Shown in the navbar and admin header. Replaces the FLEX text."
        editor={<LogoUpload initialUrl={media.logoUrl} onUploaded={setLogoUrl} />}
        preview={<LogoMiniPreview url={logoUrl} />}
      />

      {/* Hero text */}
      <EditRow
        title="🎯 Hero Section — Text"
        desc="The main banner at the top of your homepage."
        editor={<HeroTextEditor initial={hero} onPreviewChange={setHeroPreview} />}
        preview={<HeroMiniPreview hero={heroPreview} colors={colorPreview} heroImageUrl={heroImageUrl} />}
      />

      {/* Hero photo — preview reuses HeroMiniPreview so photo updates appear there */}
      <EditRow
        title="🖼️ Hero Section — Photo"
        desc="The background photo used when no video is set. Updates the hero preview above."
        editor={
          <HeroPhotoUpload
            initialImageUrl={media.heroImage}
            onUploaded={setHeroImageUrl}
          />
        }
        preview={<HeroMiniPreview hero={heroPreview} colors={colorPreview} heroImageUrl={heroImageUrl} />}
      />

      {/* Shop cover photos — one per gender, shown on /shop */}
      <EditRow
        title="🏬 Shop Cover Photos"
        desc="The banner photo at the top of the shop page. Each one shows only when that filter is active — falls back to the hero photo if left empty."
        editor={
          <ShopCoverUpload
            initialShopImage={media.shopCoverImage}
            initialMenImage={media.menCoverImage}
            initialWomenImage={media.womenCoverImage}
            onUploaded={(slot, url) => {
              if (slot === "shop") setShopCoverUrl(url);
              else if (slot === "men") setMenCoverUrl(url);
              else setWomenCoverUrl(url);
            }}
          />
        }
        preview={
          <div className="space-y-2">
            {[
              { label: "Shop", url: shopCoverUrl },
              { label: "Men", url: menCoverUrl },
              { label: "Women", url: womenCoverUrl },
            ].map(({ label, url }) => (
              <div key={label} className="overflow-hidden rounded-xl border border-[var(--color-border)]">
                <div className="relative bg-[var(--color-bg)]" style={{ aspectRatio: "16/9" }}>
                  {(url ?? heroImageUrl) && (
                    <img src={url ?? heroImageUrl ?? ""} alt="" className="h-full w-full object-cover" />
                  )}
                  <span className="absolute bottom-1 left-1.5 text-[9px] font-semibold uppercase tracking-wide text-white drop-shadow">
                    {label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        }
      />

      {/* Video file */}
      <EditRow
        title="🎬 Hero Background Video"
        desc="Plays full-screen behind the Explore button at the top of the homepage. Takes priority over the hero photo when set."
        editor={<VideoUpload initialUrl={media.videoUrl} />}
        preview={<VideoMiniPreview colors={colorPreview} />}
      />

      {/* Featured Section photo */}
      <EditRow
        title="🖼️ Featured Section — Photo"
        desc="The photo shown next to your featured products, right below the hero. Falls back to the hero photo if left empty."
        editor={
          <FeaturedPhotoUpload
            initialImageUrl={media.featuredImage}
            onUploaded={setFeaturedImageUrl}
            initialOverlay={featuredOverlay}
            onOverlayChange={setFeaturedOverlayPreview}
          />
        }
        preview={<FeaturedMiniPreview overlay={featuredOverlayPreview} imageUrl={featuredImageUrl ?? heroImageUrl} />}
      />

      {/* USP bar */}
      <EditRow
        title="✨ USP Bar — Text"
        desc="The feature highlights shown just below the hero banner."
        editor={<UspEditor initial={usps} onPreviewChange={setUspsPreview} />}
        preview={<UspMiniPreview usps={uspsPreview} colors={colorPreview} />}
      />

      {/* Editorial section — block 1 */}
      <EditRow
        title="📷 Editorial Section — Block 1"
        desc='The first "story" block shown below the USP bar (photo + label/title/description). Falls back to a featured product photo if left empty.'
        editor={
          <EditorialBlockEditor
            block={1}
            initial={editorial1}
            initialImageUrl={media.editorialImage1}
            onTextChange={setEditorial1Preview}
            onImageChange={setEditorialImage1Url}
          />
        }
        preview={<EditorialMiniPreview block={editorial1Preview} imageUrl={editorialImage1Url} />}
      />

      {/* Editorial section — block 2 */}
      <EditRow
        title="📷 Editorial Section — Block 2"
        desc="The second story block, right after Block 1. Falls back to a featured product photo if left empty."
        editor={
          <EditorialBlockEditor
            block={2}
            initial={editorial2}
            initialImageUrl={media.editorialImage2}
            onTextChange={setEditorial2Preview}
            onImageChange={setEditorialImage2Url}
          />
        }
        preview={<EditorialMiniPreview block={editorial2Preview} imageUrl={editorialImage2Url} />}
      />

      {/* Collection section text */}
      <EditRow
        title="📦 Collection Section — Text"
        desc="Label, title, and description shown above your featured products."
        editor={<CollectionTextEditor initial={collection} onPreviewChange={setCollectionPreview} />}
        preview={<CollectionMiniPreview collection={collectionPreview} colors={colorPreview} />}
      />

      {/* Footer CTA */}
      <EditRow
        title="📢 Footer Call-to-Action"
        desc="The green banner at the very bottom of the homepage."
        editor={<FooterCtaEditor initial={footerCta} onPreviewChange={setFooterPreview} />}
        preview={<FooterMiniPreview footerCta={footerPreview} colors={colorPreview} />}
      />

      {/* Colors */}
      <EditRow
        title="🎨 Brand Colors"
        desc="Pick colors for the entire site. The preview updates instantly."
        editor={<ColorEditor initial={colors} onPreviewChange={setColorPreview} />}
        preview={<ColorMiniPreview colors={colorPreview} />}
      />

      {/* Delivery fee */}
      <EditRow
        title="🚚 Delivery Fee"
        desc="Flat fee added to every order's total at checkout."
        editor={<DeliveryFeeEditor initialCents={deliveryFeeCents} onPreviewChange={setDeliveryFeePreview} />}
        preview={<DeliveryFeeMiniPreview cents={deliveryFeePreview} />}
      />

      {/* Contact info */}
      <EditRow
        title="📞 Contact Info"
        desc="Email, phone, and location shown on the public Contact page."
        editor={<ContactInfoEditor initial={contactInfo} onPreviewChange={setContactPreview} />}
        preview={<ContactInfoMiniPreview info={contactPreview} />}
      />

      {/* ── Full-page scrollable preview ── */}
      <div>
        <div className="mb-3 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--color-border)]" />
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">
            Full Page Preview
          </p>
          <div className="h-px flex-1 bg-[var(--color-border)]" />
        </div>
        <p className="mb-4 text-center text-xs text-[var(--color-muted)]">
          Scroll inside the preview to see the complete homepage with all your changes.
        </p>

        {/* browser shell */}
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] shadow-lg">
          {/* chrome bar */}
          <div className="flex items-center gap-1.5 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
            <div className="ml-3 flex flex-1 items-center rounded-full border border-[var(--color-border)] bg-white px-4 py-1.5">
              <span className="text-xs text-[var(--color-muted)]">flexcomfortshoes.com</span>
            </div>
            <span className="ml-3 rounded-full bg-[var(--color-accent)]/10 px-2.5 py-1 text-[10px] font-semibold text-[var(--color-accent)]">
              Live Preview
            </span>
          </div>

          {/* scrollable page content — no max-height cap so user can scroll freely */}
          <div className="overflow-y-auto" style={{ maxHeight: "80vh" }}>
            <StorePreview
              hero={heroPreview}
              footerCta={footerPreview}
              colors={colorPreview}
              usp={uspsPreview}
              logoUrl={logoUrl}
              heroImageUrl={heroImageUrl}
              featuredOverlay={featuredOverlayPreview}
              featuredImageUrl={featuredImageUrl}
              editorial1={editorial1Preview}
              editorialImage1Url={editorialImage1Url}
              editorial2={editorial2Preview}
              editorialImage2Url={editorialImage2Url}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
