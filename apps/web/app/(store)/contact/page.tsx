import { Mail, Phone, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/store/ContactForm";
import { getContactInfo } from "@/actions/storeConfigActions";
import { getStoreSettings } from "@/actions/storeSettingsActions";
import { getBaseUrl, getSiteIdentity, ogImages } from "@/lib/seo";

const CONTACT_TITLE = "Contact";
const CONTACT_DESCRIPTION =
  "Une question sur une commande, une pointure ou un modèle Mia Scarpa ? Contactez-nous — réponse rapide garantie, service client basé en Tunisie.";

export async function generateMetadata(): Promise<Metadata> {
  const [baseUrl, identity] = await Promise.all([getBaseUrl(), getSiteIdentity()]);
  const url = `${baseUrl}/contact`;

  return {
    title: CONTACT_TITLE,
    description: CONTACT_DESCRIPTION,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title: CONTACT_TITLE,
      description: CONTACT_DESCRIPTION,
      url,
      siteName: identity.storeName,
      images: ogImages(identity.seo.ogImage),
    },
    twitter: {
      card: "summary_large_image",
      title: CONTACT_TITLE,
      description: CONTACT_DESCRIPTION,
      images: identity.seo.twitterImage ? [identity.seo.twitterImage] : undefined,
    },
  };
}

function phoneHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : null;
}

export default async function ContactPage() {
  const [contact, settingsResult, t] = await Promise.all([
    getContactInfo(),
    getStoreSettings(),
    getTranslations("Contact"),
  ]);

  const coverImage = settingsResult.success ? settingsResult.data?.contactCoverImage ?? null : null;

  const INFO = [
    { icon: Mail, label: t("InfoEmail"), value: contact.email, href: `mailto:${contact.email}` },
    { icon: Phone, label: t("InfoPhone"), value: contact.phone, href: phoneHref(contact.phone) },
    { icon: MapPin, label: t("InfoLocation"), value: contact.location, href: null as string | null },
  ];

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--color-border)] py-20">
        {coverImage ? (
          <>
            <img
              src={coverImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/55" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-green-dark)] via-[var(--color-green)] to-[var(--color-green-mid)]" />
            <div
              className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle at 60% 40%, var(--color-green-bright) 0%, transparent 60%)" }}
            />
          </>
        )}
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">{t("HeroEyebrow")}</p>
          <h1 className="mt-3 text-4xl font-black text-white md:text-5xl">{t("HeroTitle")}</h1>
          <p className="mx-auto mt-4 max-w-md text-lg font-medium text-white/70">{t("HeroSubtitle")}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-[var(--color-bg)]">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid items-stretch gap-8 md:grid-cols-[1fr_1px_1.6fr] md:gap-10">

            {/* Contact details — inverted panel: dark block against the light form */}
            <div className="flex h-full flex-col bg-[var(--color-text)] p-8 text-white">
              <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                {t("InfoHeading")}
              </h2>

              <div className="mt-6 divide-y divide-white/10">
                {INFO.map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-center gap-4 py-4 first:pt-0">
                    <Icon className="h-5 w-5 shrink-0 text-white" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">
                        {label}
                      </p>
                      {href ? (
                        <a
                          href={href}
                          className="mt-0.5 block truncate text-lg font-medium text-white transition hover:text-white/60"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="mt-0.5 truncate text-lg font-medium text-white">{value}</p>
                      )}
                    </div>
                  </div>
                ))}

                <div className="py-4 last:pb-0">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">
                    {t("ResponseTimeHeading")}
                  </p>
                  <p className="mt-1 text-lg font-medium text-white">{contact.responseTime}</p>
                  <p className="mt-1 text-xs text-white/45">{t("ResponseTimeNote")}</p>
                </div>
              </div>
            </div>

            {/* divider between the details panel and the form */}
            <div className="h-px w-full self-stretch bg-[var(--color-border)] md:h-full md:w-px" />

            {/* Form — light, airy, opposite the dark panel */}
            <div>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-text)]">
                {t("FormHeading")}
              </h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
