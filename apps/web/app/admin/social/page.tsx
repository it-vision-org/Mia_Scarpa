import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Skeleton, CardListSkeleton } from "@/components/admin/Skeleton";
import { SocialContent } from "./SocialContent";

export default async function AdminSocialPage() {
  const t = await getTranslations("Admin");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">{t("SocialTitle")}</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">{t("SocialDesc")}</p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-4 w-32" />
            <CardListSkeleton rows={5} />
          </div>
        }
      >
        <SocialContent />
      </Suspense>
    </div>
  );
}
