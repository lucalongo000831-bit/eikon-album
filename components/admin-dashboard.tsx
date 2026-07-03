"use client";

import { useState } from "react";
import { LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import type { Album, AlbumFormValues, AlbumWithPhotos, Photo } from "@/lib/types";
import type { Profile } from "@/lib/profiles";
import { AlbumForm } from "./album-form";
import { PhotoUploader } from "./photo-uploader";

type AdminDashboardProps = {
  initialAlbums: AlbumWithPhotos[];
  profile: Profile;
  configured: boolean;
};

function albumFromRecord(row: Record<string, unknown>): AlbumWithPhotos {
  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    profile_key:
      row.profile_key === "rachele"
        ? "rachele"
        : row.profile_key === "emanuele"
          ? "emanuele"
          : "luca",
    description: row.description ? String(row.description) : null,
    year: typeof row.year === "number" ? row.year : null,
    location: row.location ? String(row.location) : null,
    category: row.category ? String(row.category) : null,
    folder_color: ["black", "blue", "pink", "red", "beige", "gray", "green"].includes(
      String(row.folder_color)
    )
      ? (String(row.folder_color) as Album["folder_color"])
      : "black",
    position_x: typeof row.position_x === "number" ? row.position_x : null,
    position_y: typeof row.position_y === "number" ? row.position_y : null,
    is_public: Boolean(row.is_public),
    created_at: row.created_at ? String(row.created_at) : null,
    updated_at: row.updated_at ? String(row.updated_at) : null,
    photo_count: 0,
    photos: []
  };
}

function payloadFromValues(values: AlbumFormValues, profileKey: Profile["key"]) {
  return {
    title: values.title.trim(),
    slug: values.slug.trim(),
    profile_key: profileKey,
    description: values.description.trim() || null,
    year: values.year ? Number(values.year) : null,
    location: values.location.trim() || null,
    category: values.category.trim().toLowerCase() || null,
    folder_color: values.folder_color,
    position_x: values.position_x ? Number(values.position_x) : null,
    position_y: values.position_y ? Number(values.position_y) : null,
    is_public: values.is_public
  };
}

export function AdminDashboard({
  initialAlbums,
  profile,
  configured
}: AdminDashboardProps) {
  const [albums, setAlbums] = useState(initialAlbums);
  const [selectedAlbumId, setSelectedAlbumId] = useState(initialAlbums[0]?.id ?? "");
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [message, setMessage] = useState("");

  const selectedAlbum =
    albums.find((album) => album.id === selectedAlbumId) ?? albums[0] ?? null;

  const saveAlbum = async (values: AlbumFormValues) => {
    setMessage("");
    const payload = payloadFromValues(values, profile.key);

    if (!configured) {
      if (editingAlbum) {
        setAlbums((current) =>
          current.map((album) =>
            album.id === editingAlbum.id
              ? { ...album, ...payload, photo_count: album.photos.length }
              : album
          )
        );
        setEditingAlbum(null);
      } else {
        const localAlbum: AlbumWithPhotos = {
          id: `local-${Date.now()}`,
          ...payload,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          photo_count: 0,
          photos: []
        };
        setAlbums((current) => [...current, localAlbum]);
        setSelectedAlbumId(localAlbum.id);
      }
      setMessage("Anteprima aggiornata localmente");
      return;
    }

    if (editingAlbum) {
      const response = await fetch(`/api/admin/albums/${editingAlbum.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const body = await response.json();

      if (!response.ok) {
        setMessage(body.error ?? "Aggiornamento non riuscito");
        return;
      }

      const updatedAlbum = albumFromRecord(body.album);
      setAlbums((current) =>
        current.map((album) =>
          album.id === editingAlbum.id
            ? {
                ...updatedAlbum,
                photos: album.photos,
                photo_count: album.photos.length
              }
            : album
        )
      );
      setEditingAlbum(null);
      setMessage("Album aggiornato");
      return;
    }

    const response = await fetch("/api/admin/albums", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const body = await response.json();

    if (!response.ok) {
      setMessage(body.error ?? "Creazione non riuscita");
      return;
    }

    const createdAlbum = albumFromRecord(body.album);
    setAlbums((current) => [...current, createdAlbum]);
    setSelectedAlbumId(createdAlbum.id);
    setMessage("Album creato");
  };

  const deleteAlbum = async (album: AlbumWithPhotos) => {
    setMessage("");

    if (!window.confirm(`Eliminare ${album.title}?`)) {
      return;
    }

    if (!configured) {
      setAlbums((current) => current.filter((item) => item.id !== album.id));
      setSelectedAlbumId(albums.find((item) => item.id !== album.id)?.id ?? "");
      return;
    }

    const response = await fetch(`/api/admin/albums/${album.id}`, {
      method: "DELETE"
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      setMessage(body.error ?? "Eliminazione non riuscita");
      return;
    }

    setAlbums((current) => current.filter((item) => item.id !== album.id));
    setSelectedAlbumId(albums.find((item) => item.id !== album.id)?.id ?? "");
    setMessage("Album eliminato");
  };

  const updatePhotos = (albumId: string, photos: Photo[]) => {
    setAlbums((current) =>
      current.map((album) =>
        album.id === albumId
          ? { ...album, photos, photo_count: photos.length }
          : album
      )
    );
  };

  const signOut = async () => {
    window.location.href = "/logout";
  };

  return (
    <main className="min-h-screen bg-white px-5 pb-16 pt-[84px] md:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[340px_1fr]">
        <aside className="grid content-start gap-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-base font-semibold uppercase">Admin</h1>
              <p className="mt-2 text-xs uppercase text-neutral-500">
                {profile.name} / {configured ? "Codice admin attivo" : "Demo locale"}
              </p>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="flex size-9 items-center justify-center border border-neutral-200"
              aria-label="Esci"
            >
              <LogOut size={16} />
            </button>
          </div>

          <div className="grid gap-2">
            {albums.map((album) => (
              <button
                key={album.id}
                type="button"
                onClick={() => setSelectedAlbumId(album.id)}
                className={`grid gap-1 border px-3 py-3 text-left ${
                  selectedAlbum?.id === album.id
                    ? "border-neutral-950"
                    : "border-neutral-200"
                }`}
              >
                <span className="text-sm font-semibold uppercase">{album.title}</span>
                <span className="text-xs uppercase text-neutral-500">
                  {album.photo_count ?? album.photos.length} foto
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="grid content-start gap-8">
          {message ? (
            <p className="border border-neutral-200 px-3 py-2 text-sm text-neutral-700">
              {message}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase">
                {editingAlbum ? `Modifica ${editingAlbum.title}` : "Nuovo album"}
              </h2>
              <p className="mt-1 text-xs uppercase text-neutral-500">
                Posizione cartella, colore e metadati
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEditingAlbum(null)}
              className="flex h-9 items-center gap-2 border border-neutral-200 px-3 text-xs uppercase"
            >
              <Plus size={14} />
              Nuovo
            </button>
          </div>

          <AlbumForm
            key={editingAlbum?.id ?? "new-album"}
            album={editingAlbum}
            onSubmit={saveAlbum}
            onCancel={() => setEditingAlbum(null)}
          />

          {selectedAlbum ? (
            <section className="grid gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-5">
                <div>
                  <h2 className="text-sm font-semibold uppercase">
                    {selectedAlbum.title}
                  </h2>
                  <p className="mt-1 text-xs uppercase text-neutral-500">
                    {selectedAlbum.is_public ? "Pubblico" : "Privato"} /{" "}
                    {selectedAlbum.slug}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingAlbum(selectedAlbum)}
                    className="flex size-9 items-center justify-center border border-neutral-200"
                    aria-label="Modifica album"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteAlbum(selectedAlbum)}
                    className="flex size-9 items-center justify-center border border-neutral-200"
                    aria-label="Elimina album"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <PhotoUploader
                album={selectedAlbum}
                configured={configured}
                onPhotosChange={(photos) => updatePhotos(selectedAlbum.id, photos)}
              />
            </section>
          ) : null}
        </section>
      </div>
    </main>
  );
}
