// src/helpers/catalog.ts
export type Album = { name: string; desc?: string; albumId: string };
export type Tag   = { name: string; desc?: string; tagId: string };

async function fetchJSON<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal, headers: { "Accept": "application/json" } });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`GET ${url} -> ${res.status} ${res.statusText}${txt ? `: ${txt}` : ""}`);
  }
  return res.json() as Promise<T>;
}

export const getAlbums = (signal?: AbortSignal) =>
  fetchJSON<Album[]>("/api/albums", signal);

export const getTags = (signal?: AbortSignal) =>
  fetchJSON<Tag[]>("/api/tags", signal);

export const getAlbumsAndTags = async (signal?: AbortSignal) => {
  const [albums, tags] = await Promise.all([getAlbums(signal), getTags(signal)]);
  return { albums, tags };
};
