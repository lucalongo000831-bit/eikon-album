"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
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
      className="fixed inset-0 z-[80] flex items-center justify-center bg-white/96 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Foto aperta"
    >
      <button
        type="button"
        className="absolute right-4 top-4 flex size-10 items-center justify-center text-neutral-800 transition hover:text-black"
        onClick={onClose}
        aria-label="Chiudi"
      >
        <X size={24} strokeWidth={1.7} />
      </button>
      <button
        type="button"
        className="absolute left-4 top-4 h-10 border border-neutral-300 px-3 text-xs uppercase text-neutral-800 transition hover:border-neutral-950 hover:text-black"
        onClick={onClose}
      >
        Back
      </button>

      <div className="grid w-full max-w-6xl grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2 md:grid-cols-[56px_minmax(0,1fr)_56px] md:gap-4">
        {photos.length > 1 ? (
          <button
            type="button"
            className="flex h-16 items-center justify-center text-5xl font-light leading-none text-black transition hover:bg-neutral-100 md:h-20"
            onClick={onPrevious}
            aria-label="Foto precedente"
          >
            {"<"}
          </button>
        ) : (
          <span />
        )}
      <figure className="flex h-full max-h-[86vh] min-w-0 flex-col items-center justify-center gap-4">
        <img
          src={photo.resolved_url ?? photo.image_url}
          alt={photo.caption ?? "Foto album"}
          className="max-h-[82vh] max-w-full object-contain shadow-[0_18px_60px_rgba(0,0,0,0.18)]"
        />
        {photo.caption ? (
          <figcaption className="max-w-2xl text-center text-sm text-neutral-600">
            {photo.caption}
          </figcaption>
        ) : null}
      </figure>
        {photos.length > 1 ? (
          <button
            type="button"
            className="flex h-16 items-center justify-center text-5xl font-light leading-none text-black transition hover:bg-neutral-100 md:h-20"
            onClick={onNext}
            aria-label="Foto successiva"
          >
            {">"}
          </button>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
