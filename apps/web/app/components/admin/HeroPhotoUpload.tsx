"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2, ImageIcon } from "lucide-react";
import { saveHeroSettings } from "@/actions/storeSettingsActions";
import Uploader from "./Uploader";

type Props = {
  initialImageUrl: string | null;
  onUploaded?: (url: string) => void;
};

export function HeroPhotoUpload({ initialImageUrl, onUploaded }: Props) {
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
      const result = await saveHeroSettings({ heroImage: uploaded });
      if (result.success) {
        setImageUrl(uploaded);
        setImgFailed(false);
        setUploadSuccess(true);
        onUploaded?.(uploaded);
      } else {
        setUploadError(result.error ?? "Failed to save photo");
      }
    });
  }

  return (
    <div className="max-w-lg space-y-4">
      <div
        className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]"
        style={{ aspectRatio: "4/5", maxHeight: 420 }}
      >
        {imageUrl && !imgFailed ? (
          <img
            key={imageUrl}
            src={imageUrl}
            alt="Hero photo"
            className="h-full w-full object-cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-[var(--color-muted)]">
            <ImageIcon className="h-12 w-12 opacity-30" />
            <p className="text-sm">No hero photo yet</p>
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

      <Uploader
        endpoint="storeImage"
        buttonText={imageUrl ? "Upload New Photo" : "Upload Photo"}
        handleUploadComplete={handleUploadComplete}
      />
      <p className="text-xs text-[var(--color-muted)]">
        Used as the hero background when no video is set, and as the fallback photo for the
        Featured section if you haven&apos;t uploaded one there.
      </p>
    </div>
  );
}
