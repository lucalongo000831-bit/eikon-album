"use client";

import { useState } from "react";
import type { Album, AlbumFormValues, FolderColor } from "@/lib/types";
import { slugify } from "@/lib/slug";
import { cn } from "@/lib/utils";

const colors: FolderColor[] = ["black", "blue", "pink", "red", "beige", "gray", "green"];

const colorHex: Record<FolderColor, string> = {
  black: "#111111",
  blue: "#5f87df",
  pink: "#e8a4bb",
  red: "#d62f3b",
  beige: "#c7b89b",
  gray: "#8e9297",
  green: "#173f32"
};

const emptyValues: AlbumFormValues = {
  title: "",
  slug: "",
  description: "",
  year: "",
  location: "",
  category: "",
  folder_color: "black",
  position_x: "20",
  position_y: "20",
  is_public: true
};

function valuesFromAlbum(album: Album | null): AlbumFormValues {
  if (!album) {
    return emptyValues;
  }

  return {
    title: album.title,
    slug: album.slug,
    description: album.description ?? "",
    year: album.year?.toString() ?? "",
    location: album.location ?? "",
    category: album.category ?? "",
    folder_color: album.folder_color,
    position_x: album.position_x?.toString() ?? "20",
    position_y: album.position_y?.toString() ?? "20",
    is_public: album.is_public
  };
}

type AlbumFormProps = {
  album: Album | null;
  onSubmit: (values: AlbumFormValues) => Promise<void>;
  onCancel: () => void;
  disabled?: boolean;
};

export function AlbumForm({ album, onSubmit, onCancel, disabled }: AlbumFormProps) {
  const [values, setValues] = useState<AlbumFormValues>(() => valuesFromAlbum(album));
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof AlbumFormValues>(
    key: K,
    value: AlbumFormValues[K]
  ) => {
    setValues((current) => ({
      ...current,
      [key]: value,
      ...(key === "title" && !album
        ? { slug: slugify(String(value)) }
        : {})
    }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    try {
      await onSubmit({
        ...values,
        slug: values.slug || slugify(values.title)
      });

      if (!album) {
        setValues(emptyValues);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4 border-t border-neutral-200 pt-5">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-xs uppercase text-neutral-500">
          Titolo
          <input
            required
            value={values.title}
            onChange={(event) => update("title", event.target.value)}
            className="h-10 border border-neutral-200 px-3 text-sm normal-case text-neutral-950 outline-none focus:border-neutral-800"
            disabled={disabled || saving}
          />
        </label>
        <label className="grid gap-1 text-xs uppercase text-neutral-500">
          Slug
          <input
            required
            value={values.slug}
            onChange={(event) => update("slug", slugify(event.target.value))}
            className="h-10 border border-neutral-200 px-3 text-sm normal-case text-neutral-950 outline-none focus:border-neutral-800"
            disabled={disabled || saving}
          />
        </label>
      </div>

      <label className="grid gap-1 text-xs uppercase text-neutral-500">
        Descrizione
        <textarea
          value={values.description}
          onChange={(event) => update("description", event.target.value)}
          className="min-h-24 border border-neutral-200 px-3 py-2 text-sm normal-case leading-6 text-neutral-950 outline-none focus:border-neutral-800"
          disabled={disabled || saving}
        />
      </label>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-xs uppercase text-neutral-500">
          Anno
          <input
            value={values.year}
            onChange={(event) => update("year", event.target.value)}
            inputMode="numeric"
            className="h-10 border border-neutral-200 px-3 text-sm normal-case text-neutral-950 outline-none focus:border-neutral-800"
            disabled={disabled || saving}
          />
        </label>
        <label className="grid gap-1 text-xs uppercase text-neutral-500">
          Luogo
          <input
            value={values.location}
            onChange={(event) => update("location", event.target.value)}
            className="h-10 border border-neutral-200 px-3 text-sm normal-case text-neutral-950 outline-none focus:border-neutral-800"
            disabled={disabled || saving}
          />
        </label>
        <label className="grid gap-1 text-xs uppercase text-neutral-500">
          Categoria
          <input
            value={values.category}
            onChange={(event) => update("category", event.target.value)}
            className="h-10 border border-neutral-200 px-3 text-sm normal-case text-neutral-950 outline-none focus:border-neutral-800"
            disabled={disabled || saving}
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_160px_160px]">
        <fieldset className="grid gap-2">
          <legend className="text-xs uppercase text-neutral-500">Colore cartella</legend>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => update("folder_color", color)}
                className={cn(
                  "size-8 border border-neutral-200 outline-none ring-offset-2 focus:ring-2 focus:ring-neutral-900",
                  values.folder_color === color ? "ring-2 ring-neutral-950" : ""
                )}
                style={{ background: colorHex[color] }}
                aria-label={`Colore ${color}`}
                disabled={disabled || saving}
              />
            ))}
          </div>
        </fieldset>
        <label className="grid gap-1 text-xs uppercase text-neutral-500">
          X desktop
          <input
            value={values.position_x}
            onChange={(event) => update("position_x", event.target.value)}
            inputMode="numeric"
            className="h-10 border border-neutral-200 px-3 text-sm normal-case text-neutral-950 outline-none focus:border-neutral-800"
            disabled={disabled || saving}
          />
        </label>
        <label className="grid gap-1 text-xs uppercase text-neutral-500">
          Y desktop
          <input
            value={values.position_y}
            onChange={(event) => update("position_y", event.target.value)}
            inputMode="numeric"
            className="h-10 border border-neutral-200 px-3 text-sm normal-case text-neutral-950 outline-none focus:border-neutral-800"
            disabled={disabled || saving}
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={values.is_public}
          onChange={(event) => update("is_public", event.target.checked)}
          disabled={disabled || saving}
        />
        Album pubblico
      </label>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="h-9 border border-neutral-950 bg-neutral-950 px-4 text-xs uppercase text-white disabled:cursor-not-allowed disabled:opacity-40"
          disabled={disabled || saving}
        >
          {saving ? "Salvo" : album ? "Aggiorna" : "Crea album"}
        </button>
        {album ? (
          <button
            type="button"
            onClick={onCancel}
            className="h-9 border border-neutral-200 px-4 text-xs uppercase text-neutral-800"
            disabled={saving}
          >
            Annulla
          </button>
        ) : null}
      </div>
    </form>
  );
}
