import type { Album, Tag, GalleryItem, SortMode } from '../types/type';

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

export function photosInAlbum(
  albums: Album[],
  gallery: GalleryItem[],
  albumRef: { albumId?: string; name?: string },
  opts: { sort?: SortMode; limit?: number } = {}
): GalleryItem[] {
  let albumId = albumRef.albumId?.trim() || '';
  if (!albumId && albumRef.name) {
    const found = albums.find(
      (a) => a.name.localeCompare(albumRef.name!, undefined, { sensitivity: 'accent' }) === 0
    );
    albumId = found?.albumId || '';
  }
  if (!albumId) return [];

  let items = gallery.filter((g) => g.albumId === albumId);

  const cmpDate = (a: GalleryItem, b: GalleryItem) =>
    a.year - b.year || a.month - b.month || a.day - b.day;

  if (opts.sort === 'date-asc') items = [...items].sort(cmpDate);
  if (opts.sort === 'date-desc') items = [...items].sort((a, b) => -cmpDate(a, b));

  if (opts.limit && opts.limit > 0) items = items.slice(0, opts.limit);

  return items;
}

export function photosInAlbum(
  tags: Tag[],
  gallery: GalleryItem[],
  tagRef: { tagId?: string; name?: string },
  opts: { sort?: SortMode; limit?: number } = {}
): GalleryItem[] {
  let tagId = String(tagRef.tagId ?? '').trim();
  if (!tagId && tagRef.name) {
    const found = tags.find(
      (t) => t.name.localeCompare(tagRef.name!, undefined, { sensitivity: 'accent' }) === 0
    );
    tagId = found?.tagId ?? '';
  }
  if (!tagId) return [];

  let items = gallery.filter((g) => g.TagId === tagId);

  const cmpDate = (a: GalleryItem, b: GalleryItem) =>
    a.year - b.year || a.month - b.month || a.day - b.day;

  if (opts.sort === 'date-asc') items = [...items].sort(cmpDate);
  if (opts.sort === 'date-desc') items = [...items].sort((a, b) => -cmpDate(a, b));

  if (opts.limit && opts.limit > 0) items = items.slice(0, opts.limit);

  return items;
}
