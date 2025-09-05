import { NavLink } from 'react-router-dom';
import Icon from './Icon';
import type { GalleryItem } from '../types/type';

type Props = {
  title: string;
  preview: GalleryItem[];
  nbPhotos: number;
};

export default function AlbumCard({ title, preview, nbPhotos }: Props) {
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
      </div>
    </NavLink>
  );
}
