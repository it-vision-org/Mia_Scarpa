"use client";

import { useTranslations } from "next-intl";
import { ShoeLoader } from "@/components/store/ShoeLoader";

export default function StoreLoading() {
  const t = useTranslations("Loading");
  return <ShoeLoader label={t("Default")} />;
}
