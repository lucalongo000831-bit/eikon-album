import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin-dashboard";
import { getCurrentProfileKey, isCurrentAdminForProfile } from "@/lib/access/server";
import { getAdminAlbums } from "@/lib/data/albums";
import { getProfileByKey } from "@/lib/profiles";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminRoute() {
  const profileKey = await getCurrentProfileKey();
  const profile = getProfileByKey(profileKey);

  if (!profile) {
    redirect("/profiles");
  }

  if (!(await isCurrentAdminForProfile(profile.key))) {
    redirect("/admin/login");
  }

  const albums = await getAdminAlbums(profile.key);

  return (
    <AdminDashboard
      initialAlbums={albums}
      profile={profile}
      configured={isSupabaseAdminConfigured()}
    />
  );
}
