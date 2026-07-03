import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlbumPage } from "@/components/album-page";
import { getCurrentProfileKey } from "@/lib/access/server";
import { getAlbumBySlug } from "@/lib/data/albums";

type AlbumRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params
}: AlbumRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const profileKey = await getCurrentProfileKey();
  const album = await getAlbumBySlug(slug, profileKey);

  if (!album) {
    return {
      title: "Album"
    };
  }

  return {
    title: album.title,
    description: album.description ?? `Foto e ricordi dentro ${album.title}`
  };
}

export default async function AlbumRoute({ params }: AlbumRouteProps) {
  const { slug } = await params;
  const profileKey = await getCurrentProfileKey();
  const album = await getAlbumBySlug(slug, profileKey);

  if (!album) {
    notFound();
  }

  return (
    <main className="bg-white">
      <AlbumPage album={album} />
    </main>
  );
}
