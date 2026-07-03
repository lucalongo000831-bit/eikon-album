import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Album, AlbumWithPhotos, Photo } from "@/lib/types";
import { isProfileKey, type ProfileKey } from "@/lib/profiles";
import { demoAlbums, demoAlbumsWithPhotos } from "./demo-data";

function normalizeFolderColor(value: unknown): Album["folder_color"] {
  const allowed = ["black", "blue", "pink", "red", "beige", "gray", "green"];
  return allowed.includes(String(value))
    ? (String(value) as Album["folder_color"])
    : "black";
}

function normalizeProfileKey(value: unknown): ProfileKey {
  return isProfileKey(value) ? value : "luca";
}

function normalizeAlbum(row: Record<string, unknown>): Album {
  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    profile_key: normalizeProfileKey(row.profile_key),
    description: row.description ? String(row.description) : null,
    year: typeof row.year === "number" ? row.year : null,
    location: row.location ? String(row.location) : null,
    category: row.category ? String(row.category) : null,
    folder_color: normalizeFolderColor(row.folder_color),
    position_x: typeof row.position_x === "number" ? row.position_x : null,
    position_y: typeof row.position_y === "number" ? row.position_y : null,
    is_public: Boolean(row.is_public),
    created_at: row.created_at ? String(row.created_at) : null,
    updated_at: row.updated_at ? String(row.updated_at) : null
  };
}

function normalizePhoto(row: Record<string, unknown>): Photo {
  return {
    id: String(row.id),
    album_id: String(row.album_id),
    image_url: String(row.image_url),
    storage_path: String(row.storage_path),
    caption: row.caption ? String(row.caption) : null,
    sort_order: typeof row.sort_order === "number" ? row.sort_order : 0,
    created_at: row.created_at ? String(row.created_at) : null
  };
}

async function withSignedPhotoUrls(photos: Photo[]) {
  const supabase = await createSupabaseServerClient();

  if (!supabase || photos.length === 0) {
    return photos;
  }

  const signed = await Promise.all(
    photos.map(async (photo) => {
      if (!photo.storage_path || photo.storage_path.startsWith("demo/")) {
        return { ...photo, resolved_url: photo.image_url };
      }

      const { data } = await supabase.storage
        .from("memories")
        .createSignedUrl(photo.storage_path, 60 * 60);

      return {
        ...photo,
        resolved_url: data?.signedUrl ?? photo.image_url
      };
    })
  );

  return signed;
}

export async function getPublicAlbums(profileKey?: ProfileKey | null): Promise<Album[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return profileKey
      ? demoAlbums.filter((album) => album.profile_key === profileKey)
      : demoAlbums;
  }

  let query = supabase
    .from("albums")
    .select("*")
    .eq("is_public", true);

  if (profileKey) {
    query = query.eq("profile_key", profileKey);
  }

  const { data, error } = await query.order("created_at", { ascending: true });

  if (error || !data) {
    return profileKey
      ? demoAlbums.filter((album) => album.profile_key === profileKey)
      : demoAlbums;
  }

  const albums = data.map((row) => normalizeAlbum(row));
  const ids = albums.map((album) => album.id);

  if (ids.length === 0) {
    return albums;
  }

  const { data: photos } = await supabase
    .from("photos")
    .select("album_id")
    .in("album_id", ids);

  const counts = new Map<string, number>();
  photos?.forEach((photo) => {
    const albumId = String(photo.album_id);
    counts.set(albumId, (counts.get(albumId) ?? 0) + 1);
  });

  return albums.map((album) => ({
    ...album,
    photo_count: counts.get(album.id) ?? 0
  }));
}

export async function getAlbumBySlug(
  slug: string,
  profileKey?: ProfileKey | null,
  includePrivate = false
): Promise<AlbumWithPhotos | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return (
      demoAlbumsWithPhotos.find(
        (album) =>
          album.slug === slug && (!profileKey || album.profile_key === profileKey)
      ) ?? null
    );
  }

  let albumQuery = supabase.from("albums").select("*").eq("slug", slug).limit(1);

  if (profileKey) {
    albumQuery = albumQuery.eq("profile_key", profileKey);
  }

  if (!includePrivate) {
    albumQuery = albumQuery.eq("is_public", true);
  }

  const { data: albumRow, error: albumError } = await albumQuery.single();

  if (albumError || !albumRow) {
    return null;
  }

  const album = normalizeAlbum(albumRow);

  const { data: photoRows } = await supabase
    .from("photos")
    .select("*")
    .eq("album_id", album.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const photos = await withSignedPhotoUrls(
    (photoRows ?? []).map((row) => normalizePhoto(row))
  );

  return {
    ...album,
    photo_count: photos.length,
    photos
  };
}

export async function getAdminAlbums(profileKey: ProfileKey): Promise<AlbumWithPhotos[]> {
  const supabase =
    createSupabaseAdminClient() ?? (await createSupabaseServerClient());

  if (!supabase) {
    return demoAlbumsWithPhotos.filter((album) => album.profile_key === profileKey);
  }

  const { data: albumRows, error } = await supabase
    .from("albums")
    .select("*")
    .eq("profile_key", profileKey)
    .order("created_at", { ascending: true });

  if (error || !albumRows) {
    return [];
  }

  const albums = albumRows.map((row) => normalizeAlbum(row));
  const ids = albums.map((album) => album.id);

  if (ids.length === 0) {
    return [];
  }

  const { data: photoRows } = await supabase
    .from("photos")
    .select("*")
    .in("album_id", ids)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const photos = await withSignedPhotoUrls(
    (photoRows ?? []).map((row) => normalizePhoto(row))
  );

  return albums.map((album) => {
    const albumPhotos = photos.filter((photo) => photo.album_id === album.id);

    return {
      ...album,
      photo_count: albumPhotos.length,
      photos: albumPhotos
    };
  });
}
