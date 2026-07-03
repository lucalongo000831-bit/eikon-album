import type { Album } from "@/lib/types";
import { clampPercent } from "@/lib/utils";
import { FolderIcon } from "./folder-icon";

type AccessBackdropProps = {
  albums: Album[];
};

export function AccessBackdrop({ albums }: AccessBackdropProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-white blur-[5px]">
      <div className="flex h-[52px] items-center justify-between border-b border-neutral-200 px-4 text-neutral-900 md:px-5">
        <div className="flex items-center gap-6">
          <span className="font-editorial text-[17px] uppercase leading-none">
            EIKON
          </span>
          <div className="hidden items-center gap-5 text-[15px] md:flex">
            <span>Ricordi</span>
            <span>Viaggi</span>
            <span>Anni</span>
            <span>Persone</span>
            <span>Album</span>
          </div>
        </div>
        <span className="text-[14px]">3 luglio, 08:56</span>
      </div>

      <div className="relative hidden min-h-[calc(100vh-52px)] md:block">
        {albums.map((album, index) => (
          <div
            key={album.id}
            className="absolute grid w-[190px] place-items-center gap-4 text-center"
            style={{
              left: `${clampPercent(album.position_x, 12 + index * 9)}%`,
              top: `${clampPercent(album.position_y, 14 + index * 7)}%`
            }}
          >
            <FolderIcon color={album.folder_color} />
            <span className="h-3 w-24 bg-neutral-900/70" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-12 px-5 py-10 sm:grid-cols-3 md:hidden">
        {albums.map((album) => (
          <div
            key={album.id}
            className="mx-auto grid w-[190px] place-items-center gap-4 text-center"
          >
            <FolderIcon color={album.folder_color} />
            <span className="h-3 w-24 bg-neutral-900/70" />
          </div>
        ))}
      </div>
    </div>
  );
}
