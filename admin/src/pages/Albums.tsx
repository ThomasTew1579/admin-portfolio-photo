// import { useEffect, useRef, useState } from 'react';
import AlbumCard from '../components/AlbumCard';
import albumsJson from '../assets/album.json';
import galleryJson from '../assets/gallery.json';
import { photosInAlbum } from '../helpers/catalog';
import type { Album, GalleryItem } from '../types/type';

const albums = albumsJson as Album[];
const gallery = galleryJson as GalleryItem[];

export default function AlbumsPage() {
  const getPreview = (albumId: string): GalleryItem[] =>
    photosInAlbum(albums, gallery, { albumId }, { sort: 'date-desc', limit: 1 });
  const getNbPhotos = (albumId: string): number => {
    const photoInAlbum: GalleryItem[] = photosInAlbum(albums, gallery, { albumId });
    return photoInAlbum.length;
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
          />
        ))}
      </div>
    </div>
  );
}
