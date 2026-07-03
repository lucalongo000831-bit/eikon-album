"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import type { AlbumWithPhotos, Photo } from "@/lib/types";

type PhotoUploaderProps = {
  album: AlbumWithPhotos;
  configured: boolean;
  onPhotosChange: (photos: Photo[]) => void;
};

export function PhotoUploader({
  album,
  configured,
  onPhotosChange
}: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const disabled = !configured || uploading;

  const uploadFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.set("album_id", album.id);
      formData.set("album_slug", album.slug);
      formData.set("start_order", String(album.photos.length));
      files.forEach((file) => formData.append("files", file));

      const response = await fetch("/api/admin/photos/upload", {
        method: "POST",
        body: formData
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error ?? "Upload non riuscito");
      }

      onPhotosChange([...album.photos, ...(body.photos as Photo[])]);
      event.target.value = "";
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload non riuscito");
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (photo: Photo) => {
    if (!configured) {
      onPhotosChange(album.photos.filter((item) => item.id !== photo.id));
      return;
    }

    setError("");
    const response = await fetch(`/api/admin/photos/${photo.id}`, {
      method: "DELETE"
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(body.error ?? "Eliminazione non riuscita");
      return;
    }

    onPhotosChange(album.photos.filter((item) => item.id !== photo.id));
  };

  const updateCaption = async (photo: Photo, caption: string) => {
    const nextPhotos = album.photos.map((item) =>
      item.id === photo.id ? { ...item, caption } : item
    );
    onPhotosChange(nextPhotos);

    if (!configured) {
      return;
    }

    const response = await fetch(`/api/admin/photos/${photo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption: caption || null })
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(body.error ?? "Caption non salvata");
    }
  };

  const movePhoto = async (photo: Photo, direction: -1 | 1) => {
    const index = album.photos.findIndex((item) => item.id === photo.id);
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= album.photos.length) {
      return;
    }

    const nextPhotos = [...album.photos];
    const target = nextPhotos[targetIndex];
    nextPhotos[targetIndex] = photo;
    nextPhotos[index] = target;

    const reordered = nextPhotos.map((item, sort_order) => ({
      ...item,
      sort_order
    }));

    onPhotosChange(reordered);

    if (!configured) {
      return;
    }

    const results = await Promise.all(
      [reordered[index], reordered[targetIndex]].map((item) =>
        fetch(`/api/admin/photos/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: item.sort_order })
        })
      )
    );
    const failed = results.find((result) => !result.ok);

    if (failed) {
      const body = await failed.json().catch(() => ({}));
      setError(body.error ?? "Riordino non salvato");
    }
  };

  return (
    <section className="grid gap-5 border-t border-neutral-200 pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase">Foto</h3>
          <p className="mt-1 text-xs uppercase text-neutral-500">
            {album.photos.length} elementi
          </p>
        </div>
        <label className="inline-flex h-9 cursor-pointer items-center border border-neutral-950 bg-neutral-950 px-4 text-xs uppercase text-white has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-40">
          {uploading ? "Carico" : "Carica foto"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={uploadFiles}
            disabled={disabled}
          />
        </label>
      </div>

      {!configured ? (
        <p className="text-sm leading-6 text-neutral-600">
          Configura Supabase e SUPABASE_SERVICE_ROLE_KEY per salvare davvero album e immagini. In questa anteprima i dati demo sono solo locali.
        </p>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-3">
        {album.photos.map((photo, index) => (
          <div
            key={photo.id}
            className="grid grid-cols-[72px_1fr_auto] items-center gap-3 border-b border-neutral-100 pb-3"
          >
            <img
              src={photo.resolved_url ?? photo.image_url}
              alt={photo.caption ?? "Foto"}
              className="size-[72px] object-cover"
            />
            <label className="grid gap-1 text-xs uppercase text-neutral-500">
              Caption
              <input
                value={photo.caption ?? ""}
                onChange={(event) => updateCaption(photo, event.target.value)}
                className="h-9 border border-neutral-200 px-2 text-sm normal-case text-neutral-950 outline-none focus:border-neutral-800"
                disabled={!configured}
              />
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => movePhoto(photo, -1)}
                className="flex size-8 items-center justify-center border border-neutral-200 text-neutral-700 disabled:opacity-30"
                disabled={index === 0}
                aria-label="Sposta su"
              >
                <ArrowUp size={15} />
              </button>
              <button
                type="button"
                onClick={() => movePhoto(photo, 1)}
                className="flex size-8 items-center justify-center border border-neutral-200 text-neutral-700 disabled:opacity-30"
                disabled={index === album.photos.length - 1}
                aria-label="Sposta giu"
              >
                <ArrowDown size={15} />
              </button>
              <button
                type="button"
                onClick={() => deletePhoto(photo)}
                className="flex size-8 items-center justify-center border border-neutral-200 text-neutral-700"
                aria-label="Elimina foto"
                disabled={!configured}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
