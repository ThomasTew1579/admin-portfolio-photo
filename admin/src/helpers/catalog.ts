export type Album = { name: string; desc?: string; albumId: string };
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

async function fetchJSON<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`GET ${url} -> ${res.status} ${res.statusText}${txt ? `: ${txt}` : ''}`);
  }
  return res.json() as Promise<T>;
}

export const getAlbums = (signal?: AbortSignal) => fetchJSON<Album[]>('/api/albums', signal);

export const getTags = (signal?: AbortSignal) => fetchJSON<Tag[]>('/api/tags', signal);

export const getAlbumsAndTags = async (signal?: AbortSignal) => {
  const [albums, tags] = await Promise.all([getAlbums(signal), getTags(signal)]);
  return { albums, tags };
};

export const getAlbumPhotos = async (
  albumId: string,
  limit?: number,
  signal?: AbortSignal
): Promise<GalleryItem[]> => {
  const url = new URL(`/api/albums/${encodeURIComponent(albumId)}/photos`, window.location.origin);
  if (limit) url.searchParams.set('limit', String(limit));
  const res = await fetch(url.toString().replace(window.location.origin, ''), { signal });
  if (!res.ok) throw new Error(`GET ${url.pathname} -> ${res.status}`);
  return res.json();
};
