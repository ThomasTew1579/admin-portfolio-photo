import gallery from '../assets/gallery.json';
import Icon from '../components/Icon';

type PhotoLibraryProps = {
  grid: number;
  objectFit: boolean;
};

function PhotoLibrary({ grid, objectFit }: PhotoLibraryProps) {
  const fit: string = objectFit ? ' md:object-cover' : ' md:object-contain';

  return (
    <div className="photo-library p-3">
      <div
        className="grid gap-2 grid-cols-3 md:[grid-template-columns:repeat(auto-fit,minmax(var(--grid,220px),1fr))] "
        style={{ ['--grid' as string]: `${grid}px` }}
      >
        {gallery.map((_, idx) => (
          <div key={idx} className="photo relative aspect-square h-full overflow-clip group">
            <img
              className={
                'h-full w-full object-cover group-hover:scale-110 duration-200 group-hover:opacity-80' +
                fit
              }
              src={gallery[idx].path}
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

export default PhotoLibrary;
