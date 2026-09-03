"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2, ImageIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { savePromoBadgeImage } from "@/actions/storeSettingsActions";
import Uploader from "./Uploader";

type Props = {
  initialImageUrl: string | null;
  onUploaded?: (url: string | null) => void;
};

export function PromoBadgeUpload({ initialImageUrl, onUploaded }: Props) {
  const t = useTranslations("Admin");
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [imgFailed, setImgFailed] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadPending, startUploadTransition] = useTransition();

  function save(url: string | null) {
    setUploadError("");
    setUploadSuccess(false);
    startUploadTransition(async () => {
      const result = await savePromoBadgeImage(url);
      if (result.success) {
        setImageUrl(url);
        setImgFailed(false);
        setUploadSuccess(true);
        onUploaded?.(url);
      } else {
        setUploadError(result.error ?? t("FailedToSavePhoto"));
      }
    });
  }

  function handleUploadComplete(res: { ufsUrl: string; url: string }[]) {
    const uploaded = res[0]?.ufsUrl;
    if (uploaded) save(uploaded);
  }

  return (
    <div className="max-w-lg space-y-4">
      <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]">
        {imageUrl && !imgFailed ? (
          <img
            key={imageUrl}
            src={imageUrl}
            alt=""
            className="h-full w-full object-contain p-4"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-[var(--color-muted)]">
            <ImageIcon className="h-10 w-10 opacity-30" />
            <p className="text-xs">{t("PromoImageHint")}</p>
          </div>
        )}

        {uploadPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
          </div>
        )}
        {uploadSuccess && !uploadPending && (
          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow">
            <CheckCircle2 className="h-3.5 w-3.5" /> {t("SavedExcl")}
          </div>
        )}
      </div>

      {uploadError && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{uploadError}</p>
      )}

      <div className="flex items-center gap-3">
        <Uploader
          endpoint="storeImage"
          buttonText={imageUrl ? t("UploadNewPhoto") : t("UploadPhoto")}
          handleUploadComplete={handleUploadComplete}
        />
        {imageUrl && (
          <button
            type="button"
            onClick={() => save(null)}
            className="text-sm font-semibold text-[var(--color-muted)] transition hover:text-red-600"
          >
            {t("Remove")}
          </button>
        )}
      </div>
    </div>
  );
}
