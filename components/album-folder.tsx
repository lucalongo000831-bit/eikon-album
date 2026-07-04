"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useRef } from "react";
import type { CSSProperties, MouseEvent } from "react";
import type { Album } from "@/lib/types";
import { FolderIcon } from "./folder-icon";
import { cn } from "@/lib/utils";

type AlbumFolderProps = {
  album: Album;
  className?: string;
  style?: CSSProperties;
};

export function AlbumFolder({ album, className, style }: AlbumFolderProps) {
  const draggedRef = useRef(false);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!draggedRef.current) {
      return;
    }

    event.preventDefault();
    draggedRef.current = false;
  };

  return (
    <motion.div
      className={cn("w-[150px] cursor-grab select-none text-center active:cursor-grabbing", className)}
      style={style}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      whileHover={{ y: -5 }}
      drag
      dragMomentum={false}
      onDragStart={() => {
        draggedRef.current = true;
      }}
      onPointerDown={() => {
        draggedRef.current = false;
      }}
    >
      <Link
        href={`/album/${album.slug}`}
        onClick={handleClick}
        className="group flex flex-col items-center gap-3 outline-none"
        aria-label={`Apri album ${album.title}`}
        draggable={false}
      >
        <FolderIcon color={album.folder_color} />
        <span className="max-w-[150px] text-balance text-[12px] font-medium uppercase leading-snug text-neutral-800 group-hover:text-black">
          {album.title}
        </span>
      </Link>
    </motion.div>
  );
}
