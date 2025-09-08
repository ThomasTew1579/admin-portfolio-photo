import { useState } from 'react';
import AlbumCard from '../components/AlbumCard';
import albumsJson from '../../../portfolio/src/assets/album.json';
import galleryJson from '../../../portfolio/src/assets/gallery.json';
import { photosInAlbum, updateAlbum } from '../helpers/catalog';
import type { Album, GalleryItem } from '../types/type';

const initialAlbums = albumsJson as Album[];
const gallery = galleryJson as GalleryItem[];

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>(initialAlbums);

  const getPreview = (albumId: string): GalleryItem[] =>
    photosInAlbum(albums, gallery, { albumId }, { sort: 'date-desc', limit: 1 });
  const getNbPhotos = (albumId: string): number => {
    const photoInAlbum: GalleryItem[] = photosInAlbum(albums, gallery, { albumId });
    return photoInAlbum.length;
  };

  const togglePublished = async (album: Album) => {
    try {
      const next = !album.published;
      setAlbums((prev) =>
        prev.map((a) => (a.albumId === album.albumId ? { ...a, published: next } : a))
      );
      await updateAlbum(album.albumId, { published: next });
    } catch (e) {
      // revert on error
      setAlbums((prev) =>
        prev.map((a) => (a.albumId === album.albumId ? { ...a, published: album.published } : a))
      );
      console.error(e);
    }
  };

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
          <AlbumCard
            key={a.albumId}
            title={a.name}
            nbPhotos={getNbPhotos(a.albumId)}
            preview={getPreview(a.albumId)}
            published={a.published}
            onTogglePublished={() => togglePublished(a)}
          />
        ))}
      </div>
    </div>
  );
}
