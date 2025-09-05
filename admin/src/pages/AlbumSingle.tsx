import albumsJson from '../assets/album.json';
import galleryJson from '../assets/gallery.json';
import Icon from '../components/Icon';
import { photosInAlbum } from '../helpers/catalog';
import { useSearchParams } from 'react-router-dom';
import type { GalleryItem, Album } from '../types/type';

type AlbumProps = {
  grid: number;
  objectFit: boolean;
};

const albums = albumsJson as Album[];
const gallery = galleryJson as GalleryItem[];

function AlbumSingle({ grid, objectFit }: AlbumProps) {
  const fit: string = objectFit ? ' md:object-cover' : ' md:object-contain';
  const [searchParams] = useSearchParams();
  const param = searchParams.get('title')?.toString();
  const galleryAlbum: GalleryItem[] = photosInAlbum(
    albums,
    gallery,
    { albumId: '', name: param },
    { sort: 'date-desc', limit: 4 }
  );

  return (
    <div className="photo-library p-3">
      <div
        className="grid gap-2 grid-cols-3 md:[grid-template-columns:repeat(auto-fit,minmax(var(--grid,220px),1fr))] "
        style={{ ['--grid' as string]: `${grid}px` }}
      >
        {galleryAlbum.map((_, idx) => (
          <div key={idx} className="photo relative aspect-square h-full overflow-clip group">
            <img
              className={
                'h-full w-full object-cover group-hover:scale-110 duration-200 group-hover:opacity-80' +
                fit
              }
              src={galleryAlbum[idx].path}
              alt=""
            />
            <button className="absolute top-1/2 left-1/2 -translate-1/2 group-hover:opacity-100 opacity-0 duration-200">
              <Icon name="circle-ellipsis" size={40} className="fill-white z-10" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AlbumSingle;
