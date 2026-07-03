import type { AlbumWithPhotos } from "@/lib/types";
import { Breadcrumb } from "./breadcrumb";
import { PhotoGrid } from "./photo-grid";

type AlbumPageProps = {
  album: AlbumWithPhotos;
};

export function AlbumPage({ album }: AlbumPageProps) {
  const details = [
    album.year?.toString(),
    album.location,
    album.category
  ].filter(Boolean);

  return (
    <article className="album-open mx-auto min-h-[calc(100vh-52px)] max-w-5xl px-5 pb-16 pt-[84px] md:px-8">
      <div className="mb-9 flex flex-col gap-5 border-b border-neutral-200 pb-7">
        <Breadcrumb current={album.title} />
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <h1 className="text-lg font-semibold uppercase leading-none text-neutral-950 md:text-xl">
              {album.title}
            </h1>
            {details.length > 0 ? (
              <p className="mt-3 text-xs uppercase text-neutral-500">
                {details.join(" / ")}
              </p>
            ) : null}
            {album.description ? (
              <p className="mt-5 max-w-xl text-sm leading-6 text-neutral-700">
                {album.description}
              </p>
            ) : null}
          </div>
          <p className="text-xs uppercase text-neutral-500">
            {album.photos.length} foto
          </p>
        </div>
      </div>
      <PhotoGrid photos={album.photos} />
    </article>
  );
}
