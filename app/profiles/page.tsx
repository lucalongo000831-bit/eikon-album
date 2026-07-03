import { ProfileChooser } from "@/components/profile-chooser";

export const dynamic = "force-dynamic";

export default function ProfilesPage() {
  return (
    <main className="min-h-screen bg-white px-5 pt-[92px]">
      <section className="mx-auto flex min-h-[calc(100vh-140px)] w-full max-w-5xl items-center justify-center">
        <ProfileChooser />
      </section>
    </main>
  );
}
