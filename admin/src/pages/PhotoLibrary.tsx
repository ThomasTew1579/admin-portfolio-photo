import gallery from '../assets/gallery.json';
import ThumbnailOnGrid from '../components/ThumbnailOnGrid';

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
          <ThumbnailOnGrid id={idx} path={gallery[idx].path} fit={fit} />
        ))}
      </div>
    </div>
  );
}

export default PhotoLibrary;
