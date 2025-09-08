import { NavLink } from 'react-router-dom';
import Icon from './Icon';
import type { GalleryItem } from '../types/type';

type Props = {
  title: string;
  preview: GalleryItem[];
  nbPhotos: number;
  published?: boolean;
  onTogglePublished?: () => void;
};

export default function AlbumCard({
  title,
  preview,
  nbPhotos,
  published,
  onTogglePublished,
}: Props) {
  const hasPreview = Array.isArray(preview) && preview.length > 0;

  return (
    <NavLink
      to={`/album?title=${title}`}
      className="flex flex-row rounded-2xl overflow-clip bg-gray-400 hover:outline-3 outline-primary"
    >
      <div className="relative bg-gray-350 aspect-square h-24">
        {hasPreview ? (
          <img src={preview[0].path} alt="" className="size-full object-cover" loading="lazy" />
        ) : (
          <div className="flex size-full items-center justify-center text-gray-400 text-sm">
            <Icon name="images" size={30} className=" fill-gray-100" />
          </div>
        )}
      </div>
      <div className="p-3 w-full flex justify-center felx flex-col">
        <h3 className="text-md font-medium text-white truncate">{title}</h3>
        <span className="text-md font-medium text-gray-100">{nbPhotos}</span>
        {published !== undefined && (
          <div className=" flex items-center gap-2">
            <span
              className={`text-xs px-2 py-0.5 rounded ${published ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'}`}
            >
              {published ? 'Publié' : 'Brouillon'}
            </span>
            {onTogglePublished && (
              <button
                type="button"
                className="text-xs px-2 py-1 rounded bg-gray-600 text-white hover:bg-gray-500"
                onClick={(e) => {
                  e.preventDefault();
                  onTogglePublished();
                }}
              >
                {published ? 'Dépublier' : 'Publier'}
              </button>
            )}
          </div>
        )}
      </div>
    </NavLink>
  );
}
