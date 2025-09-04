import { useEffect, useRef, useState } from 'react';
import AlbumCard from '../components/AlbumCard';
import { getAlbumPhotos, type GalleryItem, type Album } from '../helpers/catalog';
import { useAlbumsTags } from '../hook/useAlbumsTags';

type PreviewMap = Record<string, GalleryItem[]>;

export default function AlbumsPage() {
  const { albums, loading, error } = useAlbumsTags();
  const [previews, setPreviews] = useState<PreviewMap>({});
  const [busy, setBusy] = useState(false);
  const acRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!albums.length) return;
    acRef.current?.abort();
    const ac = new AbortController();
    acRef.current = ac;

    setBusy(true);
    (async () => {
      try {
        const entries = await Promise.all(
          albums.map(async (a: Album) => {
            try {
              const ph = await getAlbumPhotos(a.albumId, 4, ac.signal);
              return [a.albumId, ph.slice(0, 4)] as const;
            } catch {
              return [a.albumId, [] as GalleryItem[]] as const;
            }
          })
        );
        setPreviews(Object.fromEntries(entries));
      } finally {
        setBusy(false);
      }
    })();

    return () => ac.abort();
  }, [albums]);

  if (loading) return <div className="p-6 text-sm text-gray-500">Chargement des albums…</div>;
  if (error) return <div className="p-6 text-sm text-red-600">Erreur: {error}</div>;

  return (
    <div className="album-list">
      <div className="head py-2 px-3 border-b-2">
        <h1 className="text-3xl text-white font-semibold">Albums</h1>
        <span className="nb-album text-md text-gray-100">
          {albums.length + ' album' + (albums.length > 1 ? 's' : '')}
        </span>
      </div>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 px-18 py-6">
        {albums.map((a) => (
          <AlbumCard key={a.albumId} title={a.name} photos={previews[a.albumId] ?? []} />
        ))}
      </div>

      {busy && <div className="mt-4 text-xs text-gray-400">Préparation des aperçus…</div>}
    </div>
  );
}
