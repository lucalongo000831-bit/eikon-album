"use client";

import { useCallback, useState } from "react";
import type { Photo } from "@/lib/types";
import { PhotoLightbox } from "./photo-lightbox";

type PhotoGridProps = {
  photos: Photo[];
};

export function PhotoGrid({ photos }: PhotoGridProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const onNext = useCallback(() => {
    setActiveIndex((index) =>
      index === null ? null : index + 1 >= photos.length ? 0 : index + 1
    );
  }, [photos.length]);

  const onPrevious = useCallback(() => {
    setActiveIndex((index) =>
      index === null ? null : index - 1 < 0 ? photos.length - 1 : index - 1
    );
  }, [photos.length]);

  if (photos.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-xs uppercase text-neutral-500">
        Cartella vuota
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            className="group grid cursor-pointer gap-2 bg-transparent p-0 text-left"
            onClick={() => setActiveIndex(index)}
            aria-label={`Apri foto ${index + 1}`}
          >
            <span className="block aspect-square overflow-hidden border border-neutral-200 bg-neutral-100">
              <img
                src={photo.resolved_url ?? photo.image_url}
                alt={photo.caption ?? `Foto ${index + 1}`}
                className="h-full w-full object-cover grayscale-[10%] transition duration-200 group-hover:scale-[1.015] group-hover:grayscale-0"
                loading={index < 6 ? "eager" : "lazy"}
              />
            </span>
            {photo.caption ? (
              <span className="line-clamp-2 min-h-8 text-[11px] leading-4 text-neutral-500">
                {photo.caption}
              </span>
            ) : (
              <span className="h-8 text-[11px] text-neutral-400" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>
      <PhotoLightbox
        photos={photos}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
        onNext={onNext}
        onPrevious={onPrevious}
      />
    </>
  );
}
