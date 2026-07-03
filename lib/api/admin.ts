import { NextResponse } from "next/server";
import { getCurrentProfileKey, isCurrentAdminForProfile } from "@/lib/access/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Album, AlbumWithPhotos, Photo } from "@/lib/types";

export async function getAdminSupabase() {
  const profileKey = await getCurrentProfileKey();

  if (!profileKey || !(await isCurrentAdminForProfile(profileKey))) {
    return {
      response: NextResponse.json({ error: "Accesso admin richiesto" }, { status: 401 })
    };
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      response: NextResponse.json(
        { error: "Configura SUPABASE_SERVICE_ROLE_KEY per salvare modifiche." },
        { status: 503 }
      )
    };
  }

  return { supabase, profileKey };
}

export function albumFromRecord(row: Record<string, unknown>): AlbumWithPhotos {
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

export function photoFromRecord(row: Record<string, unknown>): Photo {
  return {
    id: String(row.id),
    album_id: String(row.album_id),
    image_url: String(row.image_url),
    storage_path: String(row.storage_path),
    caption: row.caption ? String(row.caption) : null,
    sort_order: typeof row.sort_order === "number" ? row.sort_order : 0,
    created_at: row.created_at ? String(row.created_at) : null,
    resolved_url: row.resolved_url ? String(row.resolved_url) : undefined
  };
}
