"use client";

import { useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Photo } from "@/lib/types";

type PhotoLightboxProps = {
  photos: Photo[];
  activeIndex: number | null;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
};

export function PhotoLightbox({
  photos,
  activeIndex,
  onClose,
  onNext,
  onPrevious
}: PhotoLightboxProps) {
  const photo = activeIndex === null ? null : photos[activeIndex];

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowRight") {
        onNext();
      }

      if (event.key === "ArrowLeft") {
        onPrevious();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeIndex, onClose, onNext, onPrevious]);

  if (!photo) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/94 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Foto aperta"
    >
      <button
        type="button"
        className="absolute right-4 top-4 flex size-10 items-center justify-center text-white/80 transition hover:text-white"
        onClick={onClose}
        aria-label="Chiudi"
      >
        <X size={24} strokeWidth={1.7} />
      </button>

      {photos.length > 1 ? (
        <>
          <button
            type="button"
            className="absolute left-3 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center text-white/80 transition hover:text-white"
            onClick={onPrevious}
            aria-label="Foto precedente"
          >
            <ChevronLeft size={34} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            className="absolute right-3 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center text-white/80 transition hover:text-white"
            onClick={onNext}
            aria-label="Foto successiva"
          >
            <ChevronRight size={34} strokeWidth={1.5} />
          </button>
        </>
      ) : null}

      <figure className="flex h-full max-h-[86vh] w-full max-w-5xl flex-col items-center justify-center gap-4">
        <img
          src={photo.resolved_url ?? photo.image_url}
          alt={photo.caption ?? "Foto album"}
          className="max-h-full max-w-full object-contain shadow-[0_18px_60px_rgba(0,0,0,0.35)]"
        />
        {photo.caption ? (
          <figcaption className="max-w-2xl text-center text-sm text-white/78">
            {photo.caption}
          </figcaption>
        ) : null}
      </figure>
    </div>
  );
}
