// Pure, client-safe SEO text generation — used by the "Remplir automatiquement"
// button on the Product admin form. No server-only imports here (unlike
// app/lib/seo.ts, which pulls in next/headers and can't be used from a Client Component).
//
// Adapted to Mia Scarpa: French copy, leather footwear positioning, men's/women's split.

import type { Gender } from "@/types";

const MAX_TITLE_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 160;

const BRAND = "Mia Scarpa";

function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max - 1).trimEnd()}…` : trimmed;
}

function formatList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} et ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`;
}

function genderNoun(gender?: Gender | null): string | null {
  if (gender === "MEN") return "homme";
  if (gender === "WOMEN") return "femme";
  return null;
}

export type SeoAutofillInput = {
  name: string;
  description?: string | null;
  categoryName?: string | null;
  colorNames?: string[];
  gender?: Gender | null;
};

export type SeoAutofillResult = {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
};

/**
 * Builds SEO title/description/keywords from real name/description/category/color/
 * gender data — same fallback-safe spirit as the rest of the SEO system: only real
 * facts, nothing fabricated. A real description is used verbatim (truncated);
 * otherwise a short French template is built from name + category + colors.
 */
export function generateSeoFields(input: SeoAutofillInput): SeoAutofillResult {
  const name = input.name.trim();
  const categoryName = input.categoryName?.trim() || null;
  const colorNames = (input.colorNames ?? []).map((c) => c.trim()).filter(Boolean);
  const description = input.description?.trim() || null;
  const genre = genderNoun(input.gender);

  const titleCore = categoryName ? `${name} — ${categoryName}` : name;
  const seoTitle = truncate(`${titleCore} | ${BRAND}`, MAX_TITLE_LENGTH);

  let seoDescription: string;
  if (description) {
    seoDescription = truncate(description, MAX_DESCRIPTION_LENGTH);
  } else {
    const bits = [`Découvrez ${name}`];
    if (categoryName) bits.push(`de la collection ${categoryName}`);
    else if (genre) bits.push(`pour ${genre}`);
    if (colorNames.length > 0) bits.push(`disponible en ${formatList(colorNames)}`);
    seoDescription = truncate(
      `${bits.join(" ")} — cuir de qualité, finitions soignées et confort au quotidien. Livraison rapide partout en Tunisie.`,
      MAX_DESCRIPTION_LENGTH,
    );
  }

  const seen = new Set<string>();
  const keywords: string[] = [];
  const addKeyword = (v: string | null | undefined) => {
    const t = v?.trim();
    if (!t) return;
    const key = t.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    keywords.push(t);
  };
  addKeyword(name);
  addKeyword(categoryName);
  colorNames.forEach(addKeyword);
  if (genre) addKeyword(`chaussures ${genre}`);
  addKeyword("cuir");
  addKeyword("Tunisie");

  return { seoTitle, seoDescription, seoKeywords: keywords.join(", ") };
}
