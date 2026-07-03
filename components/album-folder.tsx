"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import type { Album } from "@/lib/types";
import { FolderIcon } from "./folder-icon";
import { cn } from "@/lib/utils";

type AlbumFolderProps = {
  album: Album;
  className?: string;
  style?: CSSProperties;
};

export function AlbumFolder({ album, className, style }: AlbumFolderProps) {
  return (
    <motion.div
      className={cn("w-[190px] select-none text-center", className)}
      style={style}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      whileHover={{ y: -5 }}
    >
      <Link
        href={`/album/${album.slug}`}
        className="group flex flex-col items-center gap-4 outline-none"
        aria-label={`Apri album ${album.title}`}
      >
        <FolderIcon color={album.folder_color} />
        <span className="max-w-[190px] text-balance text-[13px] font-medium uppercase leading-snug text-neutral-800 group-hover:text-black">
          {album.title}
        </span>
      </Link>
    </motion.div>
  );
}
