export type FolderColor =
  | "black"
  | "blue"
  | "pink"
  | "red"
  | "beige"
  | "gray"
  | "green";

export type ProfileKey = "luca" | "rachele" | "emanuele";

export type Album = {
  id: string;
  title: string;
  slug: string;
  profile_key: ProfileKey;
  description: string | null;
  year: number | null;
  location: string | null;
  category: string | null;
  folder_color: FolderColor;
  position_x: number | null;
  position_y: number | null;
  is_public: boolean;
  created_at: string | null;
  updated_at: string | null;
  photo_count?: number;
};

export type Photo = {
  id: string;
  album_id: string;
  image_url: string;
  storage_path: string;
  caption: string | null;
  sort_order: number;
  created_at: string | null;
  resolved_url?: string;
};

export type AlbumWithPhotos = Album & {
  photos: Photo[];
};

export type AlbumFormValues = {
  title: string;
  slug: string;
  description: string;
  year: string;
  location: string;
  category: string;
  folder_color: FolderColor;
  position_x: string;
  position_y: string;
  is_public: boolean;
};
