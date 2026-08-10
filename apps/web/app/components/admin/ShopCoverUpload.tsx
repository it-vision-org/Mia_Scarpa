"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2, ImageIcon } from "lucide-react";
import { saveShopCoverSettings } from "@/actions/storeSettingsActions";
import Uploader from "./Uploader";

type Slot = "shop" | "men" | "women";

const SLOT_META: Record<Slot, { field: "shopCoverImage" | "menCoverImage" | "womenCoverImage"; label: string; hint: string }> = {
  shop: { field: "shopCoverImage", label: "Shop (default)", hint: "Shown on /shop when no Men/Women filter is active" },
  men: { field: "menCoverImage", label: "Men", hint: "Shown on /shop?gender=men" },
  women: { field: "womenCoverImage", label: "Women", hint: "Shown on /shop?gender=women" },
};

function CoverSlot({
  slot,
  initialUrl,
  onUploaded,
}: {
  slot: Slot;
  initialUrl: string | null;
  onUploaded?: (url: string) => void;
}) {
  const meta = SLOT_META[slot];
  const [imageUrl, setImageUrl] = useState(initialUrl);
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
      const result = await saveShopCoverSettings({ [meta.field]: uploaded });
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
    <div className="space-y-3">
      <div>
        <p className="text-sm font-bold text-[var(--color-text)]">{meta.label}</p>
        <p className="text-xs text-[var(--color-muted)]">{meta.hint}</p>
      </div>

      <div
        className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]"
        style={{ aspectRatio: "16/9" }}
      >
        {imageUrl && !imgFailed ? (
          <img
            key={imageUrl}
            src={imageUrl}
            alt={`${meta.label} cover`}
            className="h-full w-full object-cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-[var(--color-muted)]">
            <ImageIcon className="h-8 w-8 opacity-30" />
            <p className="text-xs">No photo yet — falls back to the hero photo</p>
          </div>
        )}

        {uploadPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--color-accent)]" />
          </div>
        )}
        {uploadSuccess && !uploadPending && (
          <div className="absolute right-2 top-2 flex items-center gap-1.5 rounded-full bg-green-600 px-2.5 py-1 text-[10px] font-semibold text-white shadow">
            <CheckCircle2 className="h-3 w-3" /> Saved!
          </div>
        )}
      </div>

      {uploadError && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{uploadError}</p>
      )}

      <Uploader
        endpoint="storeImage"
        buttonText={imageUrl ? "Upload New Photo" : "Upload Photo"}
        handleUploadComplete={handleUploadComplete}
      />
    </div>
  );
}

export function ShopCoverUpload({
  initialShopImage,
  initialMenImage,
  initialWomenImage,
  onUploaded,
}: {
  initialShopImage: string | null;
  initialMenImage: string | null;
  initialWomenImage: string | null;
  onUploaded?: (slot: Slot, url: string) => void;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      <CoverSlot slot="shop" initialUrl={initialShopImage} onUploaded={(url) => onUploaded?.("shop", url)} />
      <CoverSlot slot="men" initialUrl={initialMenImage} onUploaded={(url) => onUploaded?.("men", url)} />
      <CoverSlot slot="women" initialUrl={initialWomenImage} onUploaded={(url) => onUploaded?.("women", url)} />
    </div>
  );
}
