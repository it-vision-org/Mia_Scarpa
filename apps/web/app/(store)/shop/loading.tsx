"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ShoeLoader } from "@/components/store/ShoeLoader";

export default function ShopLoading() {
  const gender = useSearchParams().get("gender");
  const t = useTranslations("Loading");

  if (gender === "men") return <ShoeLoader variant="men" label={t("Men")} />;
  if (gender === "women") return <ShoeLoader variant="women" label={t("Women")} />;
  return <ShoeLoader label={t("Shop")} />;
}
