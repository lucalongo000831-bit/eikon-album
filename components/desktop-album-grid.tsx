"use client";

import { useMemo, useState } from "react";
import type { Album } from "@/lib/types";
import { clampPercent } from "@/lib/utils";
import { AlbumFolder } from "./album-folder";

type DesktopAlbumGridProps = {
  albums: Album[];
  initialCategory?: string;
  initialView?: string;
};

export function DesktopAlbumGrid({
  albums,
  initialCategory,
  initialView
}: DesktopAlbumGridProps) {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("");
  const [category, setCategory] = useState(initialCategory ?? "");

  const years = useMemo(() => {
    const values = albums
      .map((album) => album.year)
      .filter((value): value is number => typeof value === "number");
    return Array.from(new Set(values)).sort((a, b) => b - a);
  }, [albums]);

  const categories = useMemo(() => {
    const values = albums
      .map((album) => album.category)
      .filter((value): value is string => Boolean(value));
    return Array.from(new Set(values)).sort();
  }, [albums]);

  const filteredAlbums = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return albums.filter((album) => {
      const text = [
        album.title,
        album.description,
        album.location,
        album.category,
        album.year?.toString()
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery = normalizedQuery.length === 0 || text.includes(normalizedQuery);
      const matchesYear = !year || album.year?.toString() === year;
      const matchesCategory =
        !category ||
        album.category?.toLowerCase() === category.toLowerCase();
      const matchesView = initialView !== "years" || typeof album.year === "number";

      return matchesQuery && matchesYear && matchesCategory && matchesView;
    });
  }, [albums, category, initialView, query, year]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-white pt-[52px]">
      <div className="relative hidden min-h-[calc(100vh-52px)] md:block">
        {filteredAlbums.map((album, index) => (
          <AlbumFolder
            key={album.id}
            album={album}
            className="absolute"
            style={{
              left: `${clampPercent(album.position_x, 12 + index * 9)}%`,
              top: `${clampPercent(album.position_y, 14 + index * 7)}%`
            }}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-12 px-5 py-10 sm:grid-cols-3 md:hidden">
        {filteredAlbums.map((album) => (
          <AlbumFolder key={album.id} album={album} className="mx-auto" />
        ))}
      </div>

      {filteredAlbums.length === 0 ? (
        <div className="absolute inset-x-0 top-1/2 mx-auto w-fit -translate-y-1/2 text-center text-xs uppercase text-neutral-500">
          Nessuna cartella
        </div>
      ) : null}

      <div className="fixed bottom-4 left-4 z-20 flex max-w-[calc(100vw-2rem)] flex-wrap items-center gap-2 border border-neutral-200 bg-white/92 px-2 py-2 text-xs shadow-[0_8px_20px_rgba(0,0,0,0.05)] backdrop-blur">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cerca"
          className="h-8 w-32 border border-neutral-200 bg-white px-2 text-xs outline-none placeholder:text-neutral-400 focus:border-neutral-700"
          aria-label="Cerca album"
        />
        <select
          value={year}
          onChange={(event) => setYear(event.target.value)}
          className="h-8 border border-neutral-200 bg-white px-2 text-xs outline-none focus:border-neutral-700"
          aria-label="Filtra per anno"
        >
          <option value="">Anno</option>
          {years.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="h-8 border border-neutral-200 bg-white px-2 text-xs outline-none focus:border-neutral-700"
          aria-label="Filtra per categoria"
        >
          <option value="">Categoria</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
