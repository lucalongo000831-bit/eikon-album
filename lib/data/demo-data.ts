import type { Album, AlbumWithPhotos, Photo } from "@/lib/types";

const now = new Date("2026-07-03T08:56:00.000Z").toISOString();

export const demoAlbums: Album[] = [
  {
    id: "demo-jule26",
    title: "Jule26",
    slug: "jule26",
    profile_key: "luca",
    description: "Una sera d'estate tra interni caldi, giardino e dettagli salvati.",
    year: 2026,
    location: null,
    category: "viaggi",
    folder_color: "blue",
    position_x: 58,
    position_y: 30,
    is_public: true,
    created_at: now,
    updated_at: now,
    photo_count: 6
  },
  {
    id: "demo-estate-2024",
    title: "ESTATE 2024",
    slug: "estate-2024",
    profile_key: "luca",
    description: "Giornate lunghe, mare, cene tardi e fotografie salvate senza ordine.",
    year: 2024,
    location: "Italia",
    category: "anni",
    folder_color: "black",
    position_x: 7,
    position_y: 9,
    is_public: true,
    created_at: now,
    updated_at: now,
    photo_count: 5
  },
  {
    id: "demo-sicilia",
    title: "SICILIA",
    slug: "sicilia",
    profile_key: "luca",
    description: "Strade calde, acqua trasparente e tavoli pieni.",
    year: 2024,
    location: "Sicilia",
    category: "viaggi",
    folder_color: "blue",
    position_x: 54,
    position_y: 38,
    is_public: true,
    created_at: now,
    updated_at: now,
    photo_count: 5
  },
  {
    id: "demo-roma",
    title: "ROMA",
    slug: "roma",
    profile_key: "luca",
    description: "Weekend camminando, palazzi color miele e foto scattate al volo.",
    year: 2023,
    location: "Roma",
    category: "viaggi",
    folder_color: "red",
    position_x: 47,
    position_y: 55,
    is_public: true,
    created_at: now,
    updated_at: now,
    photo_count: 4
  },
  {
    id: "demo-amici",
    title: "AMICI",
    slug: "amici",
    profile_key: "rachele",
    description: "Compleanni, stanze disordinate, treni persi e foto mosse.",
    year: null,
    location: null,
    category: "persone",
    folder_color: "green",
    position_x: 78,
    position_y: 17,
    is_public: true,
    created_at: now,
    updated_at: now,
    photo_count: 4
  },
  {
    id: "demo-famiglia",
    title: "FAMIGLIA",
    slug: "famiglia",
    profile_key: "rachele",
    description: "Tavole lunghe, case conosciute e ricordi che tornano spesso.",
    year: null,
    location: null,
    category: "persone",
    folder_color: "beige",
    position_x: 22,
    position_y: 70,
    is_public: true,
    created_at: now,
    updated_at: now,
    photo_count: 4
  },
  {
    id: "demo-universita",
    title: "UNIVERSITA",
    slug: "universita",
    profile_key: "emanuele",
    description: "Appunti, scale, bar vicini e giorni pieni.",
    year: 2025,
    location: null,
    category: "anni",
    folder_color: "gray",
    position_x: 70,
    position_y: 72,
    is_public: true,
    created_at: now,
    updated_at: now,
    photo_count: 4
  },
  {
    id: "demo-viaggi",
    title: "VIAGGI",
    slug: "viaggi",
    profile_key: "emanuele",
    description: "Una cartella madre per partire da qualche parte.",
    year: null,
    location: null,
    category: "viaggi",
    folder_color: "blue",
    position_x: 32,
    position_y: 25,
    is_public: true,
    created_at: now,
    updated_at: now,
    photo_count: 5
  }
];

const photoSeeds = [
  "sunny-road",
  "blue-water",
  "old-city",
  "late-dinner",
  "train-window"
];

function createJule26Photos(): Photo[] {
  return Array.from({ length: 6 }, (_, index) => {
    const photoNumber = String(index + 1).padStart(2, "0");
    const imageUrl = `/uploads/jule26/jule26-${photoNumber}.jpg`;

    return {
      id: `demo-jule26-photo-${index + 1}`,
      album_id: "demo-jule26",
      image_url: imageUrl,
      storage_path: `demo/jule26/${photoNumber}.jpg`,
      caption: index === 0 ? "Jule26" : null,
      sort_order: index,
      created_at: now,
      resolved_url: imageUrl
    };
  });
}

function createDemoPhotos(album: Album): Photo[] {
  if (album.slug === "jule26") {
    return createJule26Photos();
  }

  const count = album.photo_count ?? 4;

  return Array.from({ length: count }, (_, index) => ({
    id: `${album.id}-photo-${index + 1}`,
    album_id: album.id,
    image_url: `https://picsum.photos/seed/${album.slug}-${photoSeeds[index % photoSeeds.length]}/1200/1500`,
    storage_path: `demo/${album.slug}/${index + 1}.jpg`,
    caption: index === 0 ? album.description : null,
    sort_order: index,
    created_at: now,
    resolved_url: `https://picsum.photos/seed/${album.slug}-${photoSeeds[index % photoSeeds.length]}/1200/1500`
  }));
}

export const demoAlbumsWithPhotos: AlbumWithPhotos[] = demoAlbums.map((album) => ({
  ...album,
  photos: createDemoPhotos(album)
}));
