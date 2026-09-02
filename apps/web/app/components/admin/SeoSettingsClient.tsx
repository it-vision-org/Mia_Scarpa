"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AlertTriangle, ExternalLink, Image as ImageIcon, Sparkles } from "lucide-react";
import { saveSeoSettings } from "@/actions/storeSettingsActions";
import type { SerializedStoreSettings, SeoSettingsInput } from "@/types";
import { Field, SaveButton, inp } from "./HeroTextEditor";
import { KeywordsInput } from "./KeywordsInput";
import Uploader from "./Uploader";

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;

// Same safe-default copy used server-side in app/lib/seo.ts when these fields are left
// empty — duplicated here (not imported) because that module pulls in next/headers,
// which can't be used from a Client Component.
const FALLBACK_STORE_NAME = "Mia Scarpa";
const FALLBACK_SEO_DESCRIPTION =
  "Découvrez Mia Scarpa : chaussures en cuir pour homme et femme, alliant artisanat, élégance intemporelle et confort au quotidien. Livraison rapide partout en Tunisie.";
const FALLBACK_KEYWORDS = [
  "chaussures cuir tunisie",
  "chaussures homme tunisie",
  "chaussures femme tunisie",
  "souliers en cuir",
  "chaussures élégantes tunisie",
];

function domainFromUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function dedupeKeywords(items: string[]): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of items) {
    const t = raw.trim();
    if (!t || seen.has(t.toLowerCase())) continue;
    seen.add(t.toLowerCase());
    out.push(t);
  }
  return out.join(", ");
}

function CharCounter({ length, max }: { length: number; max: number }) {
  const over = length > max;
  return (
    <span className={`text-xs ${over ? "font-semibold text-red-600" : "text-[var(--color-muted)]"}`}>
      {length}/{max} caractères{over ? " — plus long que recommandé" : ""}
    </span>
  );
}

function Section({
  title,
  desc,
  children,
  pending,
  saved,
  onSave,
  onAutoFill,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
  pending: boolean;
  saved: boolean;
  onSave: () => void;
  onAutoFill?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[var(--color-text)]">{title}</h2>
          <p className="mt-0.5 text-sm text-[var(--color-muted)]">{desc}</p>
        </div>
        {onAutoFill && (
          <button
            type="button"
            onClick={onAutoFill}
            title="Remplir cette section à partir des informations de votre boutique"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--color-accent)] transition hover:bg-[var(--color-accent)]/20"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Remplir automatiquement
          </button>
        )}
      </div>
      {children}
      <div className="mt-6 flex justify-end border-t border-[var(--color-border)] pt-5">
        <SaveButton pending={pending} saved={saved} onClick={onSave} />
      </div>
    </div>
  );
}

// Facebook/WhatsApp-style link preview card
function SocialCardPreview({
  image,
  title,
  description,
  domain,
}: {
  image: string | null;
  title: string;
  description: string;
  domain: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">
      <div className="aspect-[1.91/1] w-full overflow-hidden bg-[var(--color-bg)]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={image} src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--color-muted)]">
            <ImageIcon className="h-8 w-8" />
          </div>
        )}
      </div>
      <div className="space-y-0.5 border-t border-[var(--color-border)] p-3">
        <p className="text-[10px] uppercase tracking-wide text-[var(--color-muted)]">{domain}</p>
        <p className="truncate text-sm font-semibold text-[var(--color-text)]">{title || "—"}</p>
        <p className="line-clamp-2 text-xs text-[var(--color-muted)]">{description || "—"}</p>
      </div>
    </div>
  );
}

export function SeoSettingsClient({
  initial,
  siteUrl,
}: {
  initial: SerializedStoreSettings;
  siteUrl: string;
}) {
  const domain = domainFromUrl(siteUrl);
  const [form, setForm] = useState<SeoSettingsInput>({
    orgName: initial.orgName ?? "",
    seoTitle: initial.seoTitle ?? "",
    seoDescription: initial.seoDescription ?? "",
    seoKeywords: initial.seoKeywords ?? "",
    seoCanonicalUrl: initial.seoCanonicalUrl ?? "",
    seoOgTitle: initial.seoOgTitle ?? "",
    seoOgDescription: initial.seoOgDescription ?? "",
    seoOgImage: initial.seoOgImage ?? "",
    seoTwitterTitle: initial.seoTwitterTitle ?? "",
    seoTwitterDescription: initial.seoTwitterDescription ?? "",
    seoTwitterImage: initial.seoTwitterImage ?? "",
    seoIndexingEnabled: initial.seoIndexingEnabled,
  });
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof SeoSettingsInput>(key: K, value: SeoSettingsInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    setError("");
    if (!form.orgName.trim() || !form.seoTitle.trim() || !form.seoDescription.trim()) {
      setError("Le nom de l'organisation, le titre SEO et la description SEO sont obligatoires.");
      return;
    }
    startTransition(async () => {
      const res = await saveSeoSettings(form);
      if (res.success) setSaved(true);
      else setError(res.error ?? "Échec de l'enregistrement");
    });
  }

  function handleBasicsAutoFill() {
    const name = form.orgName.trim() || FALLBACK_STORE_NAME;
    setForm((f) => ({
      ...f,
      seoTitle: `${name} — Chaussures en cuir pour homme et femme en Tunisie`,
      seoDescription: FALLBACK_SEO_DESCRIPTION,
      seoKeywords: dedupeKeywords([name, ...FALLBACK_KEYWORDS]),
    }));
    setSaved(false);
  }

  function handleCanonicalAutoFill() {
    set("seoCanonicalUrl", siteUrl);
  }

  function handleOgAutoFill() {
    setForm((f) => ({ ...f, seoOgTitle: f.seoTitle, seoOgDescription: f.seoDescription }));
    setSaved(false);
  }

  function handleTwitterAutoFill() {
    setForm((f) => ({
      ...f,
      seoTwitterTitle: f.seoOgTitle.trim() || f.seoTitle,
      seoTwitterDescription: f.seoOgDescription.trim() || f.seoDescription,
    }));
    setSaved(false);
  }

  function handleOrgAutoFill() {
    set("orgName", FALLBACK_STORE_NAME);
  }

  const ogPreviewTitle = form.seoOgTitle.trim() || form.seoTitle.trim();
  const ogPreviewDesc = form.seoOgDescription.trim() || form.seoDescription.trim();
  const twitterPreviewTitle = form.seoTwitterTitle.trim() || form.seoTitle.trim();
  const twitterPreviewDesc = form.seoTwitterDescription.trim() || form.seoDescription.trim();

  return (
    <div className="space-y-8">
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}

      {/* Search Engine Basics */}
      <Section
        title="🔍 Bases pour les moteurs de recherche"
        desc="Comment votre boutique apparaît dans les résultats Google. Sert de valeur par défaut pour toute page sans réglage propre."
        pending={pending}
        saved={saved}
        onSave={handleSave}
        onAutoFill={handleBasicsAutoFill}
      >
        <div className="space-y-4">
          <Field label="Titre SEO">
            <input value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} className={inp} maxLength={200} />
            <div className="mt-1">
              <CharCounter length={form.seoTitle.length} max={TITLE_MAX} />
            </div>
          </Field>
          <Field label="Description SEO">
            <textarea
              rows={3}
              value={form.seoDescription}
              onChange={(e) => set("seoDescription", e.target.value)}
              className={inp}
              maxLength={400}
            />
            <div className="mt-1">
              <CharCounter length={form.seoDescription.length} max={DESCRIPTION_MAX} />
            </div>
          </Field>
          <Field label="Mots-clés">
            <KeywordsInput value={form.seoKeywords} onChange={(v) => set("seoKeywords", v)} inputClassName={inp} />
          </Field>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
            <input
              type="checkbox"
              checked={form.seoIndexingEnabled}
              onChange={(e) => set("seoIndexingEnabled", e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded accent-[var(--color-accent)]"
            />
            <span>
              <span className="block text-sm font-semibold text-[var(--color-text)]">
                Autoriser l'indexation par les moteurs de recherche
              </span>
              <span className="block text-xs text-[var(--color-muted)]">
                Permet à Google et aux autres moteurs d'explorer et d'indexer votre boutique.
              </span>
            </span>
          </label>
          {!form.seoIndexingEnabled && (
            <p className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              L'indexation est désactivée — votre site sera exclu de Google et retiré du sitemap.
            </p>
          )}
        </div>
      </Section>

      {/* Canonical URL */}
      <Section
        title="🔗 URL canonique"
        desc="Avancé — remplace l'URL canonique de la page d'accueil. Laissez vide pour la générer automatiquement à partir du domaine (recommandé)."
        pending={pending}
        saved={saved}
        onSave={handleSave}
        onAutoFill={handleCanonicalAutoFill}
      >
        <Field label="URL canonique (optionnel)">
          <input
            value={form.seoCanonicalUrl}
            onChange={(e) => set("seoCanonicalUrl", e.target.value)}
            placeholder={siteUrl}
            className={inp}
          />
        </Field>
      </Section>

      {/* Open Graph */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <Section
          title="📣 Open Graph (Facebook, WhatsApp, Messenger, LinkedIn)"
          desc="Contrôle l'apparence des liens vers votre boutique lorsqu'ils sont partagés. Reprend le titre / la description SEO ci-dessus si laissé vide."
          pending={pending}
          saved={saved}
          onSave={handleSave}
          onAutoFill={handleOgAutoFill}
        >
          <div className="space-y-4">
            <Field label="Titre OG">
              <input
                value={form.seoOgTitle}
                onChange={(e) => set("seoOgTitle", e.target.value)}
                className={inp}
                placeholder={form.seoTitle}
              />
            </Field>
            <Field label="Description OG">
              <textarea
                rows={2}
                value={form.seoOgDescription}
                onChange={(e) => set("seoOgDescription", e.target.value)}
                className={inp}
                placeholder={form.seoDescription}
              />
            </Field>
            <Field label="Image OG">
              <div className="flex items-center gap-3">
                <input
                  value={form.seoOgImage}
                  onChange={(e) => set("seoOgImage", e.target.value)}
                  placeholder="Coller une URL d'image…"
                  className={`${inp} min-w-0 flex-1`}
                />
                <Uploader
                  endpoint="storeImage"
                  buttonText="Téléverser"
                  handleUploadComplete={(res) => set("seoOgImage", res[0]?.ufsUrl ?? "")}
                />
              </div>
              <p className="mt-1 text-xs text-[var(--color-muted)]">Recommandé : 1200×630px</p>
            </Field>
          </div>
        </Section>
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">Aperçu</p>
          <SocialCardPreview
            image={form.seoOgImage.trim() || null}
            title={ogPreviewTitle}
            description={ogPreviewDesc}
            domain={domain}
          />
        </div>
      </div>

      {/* Twitter Card */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <Section
          title="🐦 Twitter Card"
          desc="Contrôle l'apparence des liens partagés sur X/Twitter. Reprend les valeurs Open Graph si laissé vide."
          pending={pending}
          saved={saved}
          onSave={handleSave}
          onAutoFill={handleTwitterAutoFill}
        >
          <div className="space-y-4">
            <Field label="Titre Twitter">
              <input
                value={form.seoTwitterTitle}
                onChange={(e) => set("seoTwitterTitle", e.target.value)}
                className={inp}
                placeholder={form.seoTitle}
              />
            </Field>
            <Field label="Description Twitter">
              <textarea
                rows={2}
                value={form.seoTwitterDescription}
                onChange={(e) => set("seoTwitterDescription", e.target.value)}
                className={inp}
                placeholder={form.seoDescription}
              />
            </Field>
            <Field label="Image Twitter">
              <div className="flex items-center gap-3">
                <input
                  value={form.seoTwitterImage}
                  onChange={(e) => set("seoTwitterImage", e.target.value)}
                  placeholder="Coller une URL d'image…"
                  className={`${inp} min-w-0 flex-1`}
                />
                <Uploader
                  endpoint="storeImage"
                  buttonText="Téléverser"
                  handleUploadComplete={(res) => set("seoTwitterImage", res[0]?.ufsUrl ?? "")}
                />
              </div>
            </Field>
          </div>
        </Section>
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">Aperçu</p>
          <SocialCardPreview
            image={form.seoTwitterImage.trim() || form.seoOgImage.trim() || null}
            title={twitterPreviewTitle}
            description={twitterPreviewDesc}
            domain={domain}
          />
        </div>
      </div>

      {/* Organization */}
      <Section
        title="🏢 Organisation"
        desc="Utilisé dans le Knowledge Panel de Google et les données structurées (schema.org Organization)."
        pending={pending}
        saved={saved}
        onSave={handleSave}
        onAutoFill={handleOrgAutoFill}
      >
        <div className="space-y-4">
          <Field label="Nom de l'organisation / boutique">
            <input value={form.orgName} onChange={(e) => set("orgName", e.target.value)} className={inp} />
          </Field>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              Logo, e-mail, téléphone &amp; adresse
            </p>
            <p className="text-sm text-[var(--color-text)]">
              {initial.logoUrl ? "Logo défini" : "Aucun logo"} · {initial.contactEmail || "aucun e-mail"} ·{" "}
              {initial.contactPhone || "aucun téléphone"} · {initial.contactLocation || "aucune adresse"}
            </p>
            <Link
              href="/admin/store"
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-accent)] hover:underline"
            >
              Modifier dans Réglages boutique <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
