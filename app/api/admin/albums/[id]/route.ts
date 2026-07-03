import { NextResponse, type NextRequest } from "next/server";
import { albumFromRecord, getAdminSupabase } from "@/lib/api/admin";

export const runtime = "nodejs";

type AlbumRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: AlbumRouteContext) {
  const admin = await getAdminSupabase();

  if ("response" in admin) {
    return admin.response;
  }

  const { id } = await context.params;
  const payload = await request.json();
  const { profile_key: _profileKey, ...safePayload } = payload;
  const { data, error } = await admin.supabase
    .from("albums")
    .update(safePayload)
    .eq("id", id)
    .eq("profile_key", admin.profileKey)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ album: albumFromRecord(data) });
}

export async function DELETE(_request: NextRequest, context: AlbumRouteContext) {
  const admin = await getAdminSupabase();

  if ("response" in admin) {
    return admin.response;
  }

  const { id } = await context.params;
  const { data: album } = await admin.supabase
    .from("albums")
    .select("id")
    .eq("id", id)
    .eq("profile_key", admin.profileKey)
    .single();

  if (!album) {
    return NextResponse.json({ error: "Album non trovato per questo profilo" }, { status: 404 });
  }

  const { data: photos } = await admin.supabase
    .from("photos")
    .select("storage_path")
    .eq("album_id", id);

  const paths =
    photos
      ?.map((photo) => String(photo.storage_path))
      .filter((path) => path && !path.startsWith("demo/")) ?? [];

  const { error } = await admin.supabase
    .from("albums")
    .delete()
    .eq("id", id)
    .eq("profile_key", admin.profileKey);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (paths.length > 0) {
    await admin.supabase.storage.from("memories").remove(paths);
  }

  return NextResponse.json({ ok: true });
}
