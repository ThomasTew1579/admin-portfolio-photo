export type Album = { name: string; desc?: string; albumId: string, published: boolean };
export type Tag = { name: string; desc?: string; tagId: string };
export type GalleryItem = {
  filename: string;
  path: string;
  thumbnailPath: string;
  year: number;
  month: number;
  day: number;
  albumId: string;
  tagId: string;
  id: string;
};
export type ViewportConfig = { grid: number; objectFit: boolean };
export type FormState = {
  file: File | null;
  previewUrl?: string;
  filename: string;
  year: number;
  month: number;
  day: number;
  albumId: string;
  tagId: string;
};
export type SortMode = 'date-asc' | 'date-desc' | 'none';
