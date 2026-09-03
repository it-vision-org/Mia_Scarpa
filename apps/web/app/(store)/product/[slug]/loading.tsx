"use client";

import { useTranslations } from "next-intl";
import { ShoeLoader } from "@/components/store/ShoeLoader";

export default function ProductLoading() {
  const t = useTranslations("Loading");
  return <ShoeLoader label={t("Product")} />;
}
