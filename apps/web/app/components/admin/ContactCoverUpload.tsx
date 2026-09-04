"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2, ImageIcon } from "lucide-react";
import { saveContactCoverSettings } from "@/actions/storeSettingsActions";
import { useTranslations } from "next-intl";
import CroppedImageUploader from "./CroppedImageUploader";

type Props = {
  initialImageUrl: string | null;
  onUploaded?: (url: string) => void;
};

export function ContactCoverUpload({ initialImageUrl, onUploaded }: Props) {
  const t = useTranslations("Admin");
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [imgFailed, setImgFailed] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadPending, startUploadTransition] = useTransition();

  function handleUploadComplete(res: { ufsUrl: string; url: string }[]) {
    const uploaded = res[0]?.ufsUrl;
    if (!uploaded) return;
    setUploadError("");
    setUploadSuccess(false);
    startUploadTransition(async () => {
      const result = await saveContactCoverSettings({ contactCoverImage: uploaded });
      if (result.success) {
        setImageUrl(uploaded);
        setImgFailed(false);
        setUploadSuccess(true);
        onUploaded?.(uploaded);
      } else {
        setUploadError(result.error ?? t("FailedToSavePhoto"));
      }
    });
  }

  return (
    <div className="max-w-lg space-y-4">
      <div
        className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]"
        style={{ aspectRatio: "16/9" }}
      >
        {imageUrl && !imgFailed ? (
          <img
            key={imageUrl}
            src={imageUrl}
            alt="Contact cover photo"
            className="h-full w-full object-cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-[var(--color-muted)]">
            <ImageIcon className="h-12 w-12 opacity-30" />
            <p className="text-sm">No cover photo yet — a plain color banner is shown</p>
          </div>
        )}

        {uploadPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
          </div>
        )}
        {uploadSuccess && !uploadPending && (
          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow">
            <CheckCircle2 className="h-3.5 w-3.5" /> Photo saved!
          </div>
        )}
      </div>

      {uploadError && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{uploadError}</p>
      )}

      <CroppedImageUploader
        endpoint="storeImage"
        aspect={16 / 9}
        buttonText={imageUrl ? t("UploadNewPhoto") : t("UploadPhoto")}
        handleUploadComplete={handleUploadComplete}
      />
      <p className="text-xs text-[var(--color-muted)]">
        Shown as the banner behind the title at the top of the public Contact page.
        A dark overlay is applied so the heading stays readable.
      </p>
    </div>
  );
}
