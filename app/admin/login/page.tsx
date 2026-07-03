import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { getCurrentProfileKey } from "@/lib/access/server";
import { getProfileByKey } from "@/lib/profiles";

type AdminLoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const profileKey = await getCurrentProfileKey();
  const profile = getProfileByKey(profileKey);

  if (!profile) {
    redirect("/profiles");
  }

  const params = await searchParams;
  const hasError = params?.error === "1";
  const nextPath = params?.next ?? "/admin";

  return (
    <main className="min-h-screen bg-white px-5 pt-[92px]">
      <section className="mx-auto grid min-h-[calc(100vh-140px)] w-full max-w-[380px] place-items-center">
        <AdminLoginForm
          profile={profile}
          nextPath={nextPath}
          initialError={hasError}
        />
      </section>
    </main>
  );
}
