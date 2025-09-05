import Icon from './Icon';
import { useState } from 'react';

type ThumbnailProps = {
  path: string;
  id: number;
  fit: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
};

function ThumbnailOnGrid({ path, id, fit, onClick, onDoubleClick }: ThumbnailProps) {
  const [isActive, setIsActive] = useState(false);
  const toggleIsActive = () => setIsActive((prev) => !prev);

  return (
    <div
      key={id}
      onClick={() => {
        toggleIsActive();
      }}
      className={
        'photo relative aspect-square h-full overflow-clip group outline-primary ' +
        (isActive ? 'outline-3' : '')
      }
    >
      <img
        className={
          'h-full w-full object-cover group-hover:scale-110 duration-200 group-hover:opacity-80' +
          fit
        }
        src={path}
        alt=""
      />
      <button className="absolute top-1/2 left-1/2 -translate-1/2 group-hover:opacity-100 opacity-0 duration-200">
        <Icon name="circle-ellipsis" size={40} className="fill-white z-10" />
      </button>
    </div>
  );
}

export default ThumbnailOnGrid;
