type GalleryItem = {
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

export const getAlbumPhotos = async (albumId: string): Promise<GalleryItem[]> =>
  fetch(`/api/albums/${encodeURIComponent(albumId)}/photos`).then(r => r.json());

export const getTagPhotos = async (tagId: string): Promise<GalleryItem[]> =>
  fetch(`/api/tags/${encodeURIComponent(tagId)}/photos`).then(r => r.json());