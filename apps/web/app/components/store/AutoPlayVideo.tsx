"use client";

import { useEffect, useRef } from "react";

export function AutoPlayVideo({
  src,
  poster,
  controls = true,
  className,
}: {
  src: string;
  poster?: string;
  controls?: boolean;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {
            // autoplay blocked by browser policy — silently ignore
          });
        } else {
          video.pause();
        }
      },
      { threshold: 0.4 }, // starts playing when 40% of the video is visible
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      controls={controls}
      className={className ?? "h-full w-full object-cover"}
    />
  );
}
