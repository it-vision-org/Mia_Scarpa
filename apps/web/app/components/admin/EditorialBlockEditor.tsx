"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2, ImageIcon } from "lucide-react";
import { saveEditorialSettings } from "@/actions/storeSettingsActions";
import Uploader from "./Uploader";
import { Field, SaveButton, inp } from "./HeroTextEditor";
import type { EditorialBlock } from "@/types";

type Props = {
  block: 1 | 2;
  initial: EditorialBlock;
  initialImageUrl: string | null;
  onTextChange?: (v: EditorialBlock) => void;
  onImageChange?: (url: string) => void;
};

export function EditorialBlockEditor({ block, initial, initialImageUrl, onTextChange, onImageChange }: Props) {
  const [form, setForm] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [imgFailed, setImgFailed] = useState(false);
  const [uploadPending, startUploadTransition] = useTransition();
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");

  function set(key: keyof EditorialBlock, value: string) {
    const next = { ...form, [key]: value };
    setForm(next);
    setSaved(false);
    onTextChange?.(next);
  }

  function handleSaveText() {
    setError("");
    startTransition(async () => {
      const res = await saveEditorialSettings(
        block === 1
          ? { editorialLabel1: form.label, editorialTitle1: form.title, editorialDesc1: form.desc }
          : { editorialLabel2: form.label, editorialTitle2: form.title, editorialDesc2: form.desc },
      );
      if (res.success) setSaved(true);
      else setError(res.error ?? "Failed to save");
    });
  }

  function handleUploadComplete(res: { ufsUrl: string; url: string }[]) {
    const uploaded = res[0]?.ufsUrl;
    if (!uploaded) return;
    setUploadError("");
    setUploadSuccess(false);
    startUploadTransition(async () => {
      const result = await saveEditorialSettings(
        block === 1 ? { editorialImage1: uploaded } : { editorialImage2: uploaded },
      );
      if (result.success) {
        setImageUrl(uploaded);
        setImgFailed(false);
        setUploadSuccess(true);
        onImageChange?.(uploaded);
      } else {
        setUploadError(result.error ?? "Failed to save photo");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Photo */}
      <div className="max-w-lg space-y-3">
        <div
          className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]"
          style={{ aspectRatio: "4/5", maxHeight: 320 }}
        >
          {imageUrl && !imgFailed ? (
            <img
              key={imageUrl}
              src={imageUrl}
              alt={`Editorial block ${block} photo`}
              className="h-full w-full object-cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-[var(--color-muted)]">
              <ImageIcon className="h-10 w-10 opacity-30" />
              <p className="text-sm text-center px-4">No photo yet — falls back to a featured product photo</p>
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
      </div>

      {/* Text */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Label (eyebrow)">
          <input value={form.label} onChange={(e) => set("label", e.target.value)} className={inp} />
        </Field>
        <Field label="Title">
          <input value={form.title} onChange={(e) => set("title", e.target.value)} className={inp} />
        </Field>
      </div>
      <Field label="Description">
        <textarea rows={3} value={form.desc} onChange={(e) => set("desc", e.target.value)} className={inp} />
      </Field>
      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
      <SaveButton pending={pending} saved={saved} onClick={handleSaveText} />
    </div>
  );
}
