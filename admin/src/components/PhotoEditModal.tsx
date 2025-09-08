import { useEffect, useState } from 'react';
import type { Album, GalleryItem, Tag } from '../types/type';
import { deletePhoto, getAlbums, getTags, updatePhoto } from '../helpers/catalog';

type Props = {
  photo: GalleryItem | null;
  onClose: () => void;
  onUpdated?: (entry: GalleryItem | null, removed?: boolean) => void;
};

export default function PhotoEditModal({ photo, onClose, onUpdated }: Props) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [albumId, setAlbumId] = useState<string>(photo?.albumId ?? '');
  const [tagId, setTagId] = useState<string>(photo?.tagId ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setAlbumId(photo?.albumId ?? '');
    setTagId(photo?.tagId ?? '');
  }, [photo?.id]);

  useEffect(() => {
    const ac = new AbortController();
    Promise.all([getAlbums(ac.signal), getTags(ac.signal)])
      .then(([as, ts]) => {
        setAlbums(as);
        setTags(ts);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
    return () => ac.abort();
  }, []);

  if (!photo) return null;

  const onSave = async () => {
    if (!photo) return;
    try {
      setLoading(true);
      const res = await updatePhoto(photo.id, { albumId, tagId });
      onUpdated?.(res.entry);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (!photo) return;
    try {
      setLoading(true);
      await deletePhoto(photo.id);
      onUpdated?.(null, true);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-700 text-white rounded-lg shadow-xl w-full max-w-md p-4">
        <h3 className="text-lg font-semibold mb-3">Modifier la photo</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Album</label>
            <select
              className="w-full bg-gray-600 rounded px-2 py-2"
              value={albumId}
              onChange={(e) => setAlbumId(e.target.value)}
            >
              <option value="">— Aucun —</option>
              {albums.map((a) => (
                <option key={a.albumId} value={a.albumId}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Tag</label>
            <select
              className="w-full bg-gray-600 rounded px-2 py-2"
              value={tagId}
              onChange={(e) => setTagId(e.target.value)}
            >
              <option value="">— Aucun —</option>
              {tags.map((t) => (
                <option key={t.tagId} value={t.tagId}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          {error && <div className="text-sm text-red-300">{error}</div>}
        </div>

        <div className="mt-4 flex gap-2 justify-end">
          <button
            className="px-3 py-2 rounded bg-gray-500 hover:bg-gray-400"
            onClick={onClose}
            disabled={loading}
          >
            Annuler
          </button>
          <button
            className="px-3 py-2 rounded bg-red-600 hover:bg-red-500"
            onClick={onDelete}
            disabled={loading}
          >
            Supprimer
          </button>
          <button
            className="px-3 py-2 rounded bg-green-600 hover:bg-green-500"
            onClick={onSave}
            disabled={loading}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

