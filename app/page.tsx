import { redirect } from "next/navigation";
import { DesktopAlbumGrid } from "@/components/desktop-album-grid";
import { getCurrentProfileKey } from "@/lib/access/server";
import { getPublicAlbums } from "@/lib/data/albums";

type HomeProps = {
  searchParams?: Promise<{
    category?: string;
    view?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const resolvedSearchParams = await searchParams;
  const profileKey = await getCurrentProfileKey();

  if (!profileKey) {
    redirect("/profiles");
  }

  const albums = await getPublicAlbums(profileKey);

  return (
    <main>
      <DesktopAlbumGrid
        albums={albums}
        initialCategory={resolvedSearchParams?.category}
        initialView={resolvedSearchParams?.view}
      />
    </main>
  );
}
