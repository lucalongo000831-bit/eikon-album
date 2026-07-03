import { NextResponse, type NextRequest } from "next/server";
import { getAdminSupabase, photoFromRecord } from "@/lib/api/admin";

export const runtime = "nodejs";

type PhotoRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type AdminSession = Awaited<ReturnType<typeof getAdminSupabase>>;

async function getPhotoForCurrentProfile(
  admin: Exclude<AdminSession, { response: NextResponse }>,
  id: string
) {
  const { data: photo } = await admin.supabase
    .from("photos")
    .select("id, album_id, storage_path")
    .eq("id", id)
    .single();

  if (!photo) {
    return null;
  }

  const { data: album } = await admin.supabase
    .from("albums")
    .select("id")
    .eq("id", String(photo.album_id))
    .eq("profile_key", admin.profileKey)
    .single();

  return album ? photo : null;
}

export async function PATCH(request: NextRequest, context: PhotoRouteContext) {
  const admin = await getAdminSupabase();

  if ("response" in admin) {
    return admin.response;
  }

  const { id } = await context.params;
  const existingPhoto = await getPhotoForCurrentProfile(admin, id);

  if (!existingPhoto) {
    return NextResponse.json({ error: "Foto non trovata per questo profilo" }, { status: 404 });
  }

  const body = await request.json();
  const payload: Record<string, string | number | null> = {};

  if ("caption" in body) {
    payload.caption = body.caption ? String(body.caption) : null;
  }

  if ("sort_order" in body) {
    payload.sort_order = Number(body.sort_order);
  }

  const { data, error } = await admin.supabase
    .from("photos")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const photo = photoFromRecord(data);
  let resolvedUrl = photo.image_url;

  if (photo.storage_path && !photo.storage_path.startsWith("demo/")) {
    const { data: signed } = await admin.supabase.storage
      .from("memories")
      .createSignedUrl(photo.storage_path, 60 * 60);
    resolvedUrl = signed?.signedUrl ?? photo.image_url;
  }

  return NextResponse.json({ photo: { ...photo, resolved_url: resolvedUrl } });
}

export async function DELETE(_request: NextRequest, context: PhotoRouteContext) {
  const admin = await getAdminSupabase();

  if ("response" in admin) {
    return admin.response;
  }

  const { id } = await context.params;
  const photo = await getPhotoForCurrentProfile(admin, id);

  if (!photo) {
    return NextResponse.json({ error: "Foto non trovata per questo profilo" }, { status: 404 });
  }

  const { error } = await admin.supabase.from("photos").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const storagePath = photo?.storage_path ? String(photo.storage_path) : "";

  if (storagePath && !storagePath.startsWith("demo/")) {
    await admin.supabase.storage.from("memories").remove([storagePath]);
  }

  return NextResponse.json({ ok: true });
}
