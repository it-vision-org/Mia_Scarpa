import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Skeleton, CardListSkeleton } from "@/components/admin/Skeleton";
import { TeamContent } from "./TeamContent";

export default async function TeamPage() {
  const t = await getTranslations("Admin");
  return (
    <div className="space-y-6">
      {/* header — renders instantly, independent of the DB fetch below */}
      <h1 className="text-2xl font-bold text-[var(--color-text)]">{t("TeamTitle")}</h1>

      <Suspense
        fallback={
          <div className="space-y-3">
            <Skeleton className="h-4 w-56" />
            <CardListSkeleton rows={4} />
          </div>
        }
      >
        <TeamContent />
      </Suspense>
    </div>
  );
}
