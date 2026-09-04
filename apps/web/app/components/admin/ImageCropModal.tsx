"use client";

import { useRef, useState } from "react";
import { Check, Loader2, X, ZoomIn } from "lucide-react";
import PrimaryButton from "@/components/ui/PrimaryButton";

type Offset = { x: number; y: number };

const VIEWPORT_WIDTH = 460;
const MAX_ZOOM = 3;
const MAX_OUTPUT_WIDTH = 1600;

type Props = {
  /** Object URL of the freshly-picked file — local, so canvas export is never tainted. */
  src: string;
  /** width / height the final photo needs to fill on the site. */
  aspect: number;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
};

/**
 * Pick-then-crop step shared by every store-settings photo slot: shows the
 * full photo in a fixed viewport sized to the target ratio, with a
 * rule-of-thirds grid overlay. Drag to reposition, slide to zoom in. Confirm
 * renders exactly the visible region onto a canvas and hands back a blob —
 * that's what actually gets uploaded, not the original file.
 */
export function ImageCropModal({ src, aspect, onCancel, onConfirm }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const dragStart = useRef<{ x: number; y: number; offset: Offset } | null>(null);

  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [confirming, setConfirming] = useState(false);

  const viewportHeight = VIEWPORT_WIDTH / aspect;

  // "cover" scale — the smallest zoom=1 scale where the photo fully fills the viewport
  const baseScale = natural
    ? Math.max(VIEWPORT_WIDTH / natural.w, viewportHeight / natural.h)
    : 1;
  const scale = baseScale * zoom;
  const imgW = (natural?.w ?? 0) * scale;
  const imgH = (natural?.h ?? 0) * scale;

  function clampOffset(next: Offset, w: number, h: number): Offset {
    const minX = Math.min(0, VIEWPORT_WIDTH - w);
    const minY = Math.min(0, viewportHeight - h);
    return {
      x: Math.min(0, Math.max(minX, next.x)),
      y: Math.min(0, Math.max(minY, next.y)),
    };
  }

  function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const w = e.currentTarget.naturalWidth;
    const h = e.currentTarget.naturalHeight;
    const cover = Math.max(VIEWPORT_WIDTH / w, viewportHeight / h);
    setNatural({ w, h });
    setOffset({
      x: (VIEWPORT_WIDTH - w * cover) / 2,
      y: (viewportHeight - h * cover) / 2,
    });
  }

  function handleZoomChange(nextZoom: number) {
    if (!natural) return;
    const nextScale = baseScale * nextZoom;
    // keep whatever point is currently centered in the viewport centered after zooming
    const centerX = VIEWPORT_WIDTH / 2;
    const centerY = viewportHeight / 2;
    const anchorX = (centerX - offset.x) / scale;
    const anchorY = (centerY - offset.y) / scale;
    const nextOffset = clampOffset(
      { x: centerX - anchorX * nextScale, y: centerY - anchorY * nextScale },
      natural.w * nextScale,
      natural.h * nextScale,
    );
    setZoom(nextZoom);
    setOffset(nextOffset);
  }

  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY, offset };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragStart.current || !natural) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset(
      clampOffset(
        { x: dragStart.current.offset.x + dx, y: dragStart.current.offset.y + dy },
        imgW,
        imgH,
      ),
    );
  }

  function onPointerUp() {
    dragStart.current = null;
  }

  function handleConfirm() {
    const img = imgRef.current;
    if (!img || !natural) return;
    setConfirming(true);

    const cropX = -offset.x / scale;
    const cropY = -offset.y / scale;
    const cropW = VIEWPORT_WIDTH / scale;
    const cropH = viewportHeight / scale;

    const outputW = Math.round(Math.min(cropW, MAX_OUTPUT_WIDTH));
    const outputH = Math.round(outputW / aspect);

    const canvas = document.createElement("canvas");
    canvas.width = outputW;
    canvas.height = outputH;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setConfirming(false);
      return;
    }
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, outputW, outputH);
    canvas.toBlob(
      (blob) => {
        setConfirming(false);
        if (blob) onConfirm(blob);
      },
      "image/jpeg",
      0.92,
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4" onClick={onCancel}>
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-[var(--color-text)]">Adjust photo</h2>
            <p className="text-xs text-[var(--color-muted)]">Drag to reposition, zoom to fill the frame.</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="shrink-0 rounded-lg p-1 text-[var(--color-muted)] transition hover:bg-[var(--color-bg)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          className="relative mx-auto touch-none select-none overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]"
          style={{ width: VIEWPORT_WIDTH, height: viewportHeight, maxWidth: "100%" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {/* the image itself — img element (not background) so it can feed the canvas export directly */}
          <img
            ref={imgRef}
            src={src}
            alt=""
            onLoad={handleImageLoad}
            draggable={false}
            className="absolute left-0 top-0 max-w-none cursor-grab active:cursor-grabbing"
            style={{ width: imgW || undefined, height: imgH || undefined, transform: `translate(${offset.x}px, ${offset.y}px)` }}
          />

          {/* rule-of-thirds grid — purely visual, guides where to place the subject */}
          <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="border border-white/50" />
            ))}
          </div>

          {!natural && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--color-muted)]" />
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <ZoomIn className="h-4 w-4 shrink-0 text-[var(--color-muted)]" />
          <input
            type="range"
            min={1}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
            className="w-full accent-[var(--color-accent)]"
          />
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <PrimaryButton as="button" variant="outline" onClick={onCancel}>
            Cancel
          </PrimaryButton>
          <PrimaryButton
            as="button"
            onClick={handleConfirm}
            disabled={!natural || confirming}
            loading={confirming}
            loadingText="Cropping…"
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Use this photo
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
