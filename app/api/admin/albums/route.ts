import { NextResponse, type NextRequest } from "next/server";
import { albumFromRecord, getAdminSupabase } from "@/lib/api/admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const admin = await getAdminSupabase();

  if ("response" in admin) {
    return admin.response;
  }

  const payload = await request.json();
  const { data, error } = await admin.supabase
    .from("albums")
    .insert({
      ...payload,
      profile_key: admin.profileKey
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ album: albumFromRecord(data) });
}
