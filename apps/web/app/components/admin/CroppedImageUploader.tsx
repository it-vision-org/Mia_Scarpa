"use client";

import { useEffect, useRef, useState } from "react";
import { useUploadThing } from "@/uploadthing";
import type { OurFileRouter } from "@/api/uploadthing/core";
import { toast } from "react-hot-toast";
import { Upload } from "lucide-react";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { ImageCropModal } from "./ImageCropModal";

interface UploadResponse {
  ufsUrl: string;
  url: string;
}

interface Props {
  handleUploadComplete: (res: UploadResponse[]) => void;
  /** width / height the photo needs to fill on the site — drives the crop frame. */
  aspect: number;
  buttonText?: string;
  endpoint?: keyof OurFileRouter;
}

/**
 * Drop-in replacement for `Uploader` used by the store-settings photo slots:
 * picking a file opens a crop step (ImageCropModal) before anything is sent
 * anywhere — the cropped result is what actually gets uploaded. Same
 * `handleUploadComplete` shape as `Uploader`, so callers don't change.
 */
export default function CroppedImageUploader({
  handleUploadComplete,
  aspect,
  buttonText = "Upload Photo",
  endpoint = "storeImage",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingSrc, setPendingSrc] = useState<string | null>(null);
  const [pendingName, setPendingName] = useState("photo.jpg");
  const [progress, setProgress] = useState<number | null>(null);

  const { startUpload, isUploading } = useUploadThing(endpoint, {
    onClientUploadComplete: (res) => {
      if (res && res.length > 0) {
        handleUploadComplete(res as UploadResponse[]);
        toast.success("Image uploaded successfully!");
      }
      setProgress(null);
    },
    onUploadError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
      setProgress(null);
    },
    onUploadProgress: (p) => setProgress(p),
  });

  // don't leak the object URL — revoke whenever it's replaced or on unmount
  useEffect(() => {
    return () => {
      if (pendingSrc) URL.revokeObjectURL(pendingSrc);
    };
  }, [pendingSrc]);

  function handleClick() {
    inputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPendingName(file.name);
    setPendingSrc(URL.createObjectURL(file));
  }

  function closeCropModal() {
    setPendingSrc(null);
  }

  async function handleCropConfirm(blob: Blob) {
    const baseName = pendingName.replace(/\.[^.]+$/, "") || "photo";
    const croppedFile = new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
    closeCropModal();
    await startUpload([croppedFile]);
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <PrimaryButton
        as="button"
        onClick={handleClick}
        disabled={isUploading}
        loading={isUploading}
        loadingText={progress !== null ? `${progress}%` : "Uploading..."}
        className="flex items-center gap-2"
      >
        <Upload className="w-4 h-4 flex-shrink-0" />
        {buttonText}
      </PrimaryButton>

      {pendingSrc && (
        <ImageCropModal
          src={pendingSrc}
          aspect={aspect}
          onCancel={closeCropModal}
          onConfirm={handleCropConfirm}
        />
      )}
    </>
  );
}
