import { NextResponse, type NextRequest } from "next/server";
import { getAdminSupabase, photoFromRecord } from "@/lib/api/admin";
import { addPrivateWatermark } from "@/lib/image-watermark";

export const runtime = "nodejs";

function cleanFileName(fileName: string, index: number) {
  const [name] = fileName.split(/\.(?=[^.]+$)/);
  const cleanName = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  return `${cleanName || "foto"}-${Date.now()}-${index}.jpg`;
}

export async function POST(request: NextRequest) {
  const admin = await getAdminSupabase();

  if ("response" in admin) {
    return admin.response;
  }

  const formData = await request.formData();
  const albumId = String(formData.get("album_id") ?? "");
  const albumSlug = String(formData.get("album_slug") ?? "");
  const startOrder = Number(formData.get("start_order") ?? 0);
  const files = formData
    .getAll("files")
    .filter((value): value is File => value instanceof File);

  if (!albumId || !albumSlug || files.length === 0) {
    return NextResponse.json({ error: "Dati upload mancanti" }, { status: 400 });
  }

  const { data: album } = await admin.supabase
    .from("albums")
    .select("id")
    .eq("id", albumId)
    .eq("slug", albumSlug)
    .eq("profile_key", admin.profileKey)
    .single();

  if (!album) {
    return NextResponse.json({ error: "Album non trovato per questo profilo" }, { status: 404 });
  }

  const uploaded = [];

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const storagePath = `${albumSlug}/${cleanFileName(file.name, index)}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const watermarkedBuffer = await addPrivateWatermark(buffer, {
      label: `EIKON ${admin.profileKey}/${albumSlug}/${file.name}`
    });
    const { error: uploadError } = await admin.supabase.storage
      .from("memories")
      .upload(storagePath, watermarkedBuffer, {
        cacheControl: "3600",
        contentType: "image/jpeg",
        upsert: false
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 });
    }

    const { data, error: insertError } = await admin.supabase
      .from("photos")
      .insert({
        album_id: albumId,
        image_url: storagePath,
        storage_path: storagePath,
        sort_order: startOrder + index
      })
      .select("*")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    const { data: signed } = await admin.supabase.storage
      .from("memories")
      .createSignedUrl(storagePath, 60 * 60);

    uploaded.push({
      ...photoFromRecord(data),
      resolved_url: signed?.signedUrl ?? storagePath
    });
  }

  return NextResponse.json({ photos: uploaded });
}
