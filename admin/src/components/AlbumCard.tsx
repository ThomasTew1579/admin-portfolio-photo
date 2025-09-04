import { NavLink } from 'react-router-dom';
import { type GalleryItem } from '../helpers/catalog';
import Icon from './Icon';

type Props = {
  title: string;
  photos: GalleryItem[];
};

export default function AlbumCard({ title, photos }: Props) {
  const firstPhoto = photos[0];

  return (
    <NavLink
      to={`/albums?title=${title}`}
      className="flex flex-row rounded-2xl overflow-clip bg-gray-400 hover:outline-3 outline-primary"
    >
      <div className="relative bg-gray-350 aspect-square h-24">
        {firstPhoto ? (
          <img
            src={firstPhoto.thumbnailPath || firstPhoto.path}
            alt=""
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-gray-400 text-sm">
            <Icon name="images" size={30} className=" fill-gray-100" />
          </div>
        )}
      </div>
      <div className="p-3 w-full flex justify-center felx flex-col">
        <h3 className="text-md font-medium text-white truncate">{title}</h3>
        <span className="text-md font-medium text-gray-100">{photos.length}</span>
      </div>
    </NavLink>
  );
}
