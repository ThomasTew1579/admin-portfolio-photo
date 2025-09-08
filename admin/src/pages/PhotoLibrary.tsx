import gallery from '../../../portfolio/src/assets/gallery.json';
import ThumbnailOnGrid from '../components/ThumbnailOnGrid';
import { useState } from 'react';
import type { GalleryItem } from '../types/type';
import PhotoEditModal from '../components/PhotoEditModal';

type PhotoLibraryProps = {
  grid: number;
  objectFit: boolean;
};

function PhotoLibrary({ grid, objectFit }: PhotoLibraryProps) {
  const fit: string = objectFit ? ' md:object-cover' : ' md:object-contain';
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  return (
    <div className="photo-library relative">
      <div
        className="grid gap-2 grid-cols-3 md:[grid-template-columns:repeat(auto-fit,minmax(var(--grid,220px),1fr))]  p-3"
        style={{ ['--grid' as string]: `${grid}px` }}
      >
        {gallery.map((_, idx) => (
          <ThumbnailOnGrid
            id={idx}
            path={gallery[idx].path}
            fit={fit}
            onDoubleClick={() => setSelected(gallery[idx] as unknown as GalleryItem)}
          />
        ))}
      </div>
      {selected && (
        <PhotoEditModal
          photo={selected}
          onClose={() => setSelected(null)}
          onUpdated={(entry, removed) => {
            if (removed) {
              const i = (gallery as unknown as GalleryItem[]).findIndex(
                (g) => g.id === selected.id
              );
              if (i !== -1) (gallery as unknown as GalleryItem[]).splice(i, 1);
            } else if (entry) {
              const i = (gallery as unknown as GalleryItem[]).findIndex((g) => g.id === entry.id);
              if (i !== -1) (gallery as unknown as GalleryItem[])[i] = entry;
            }
          }}
        />
      )}
    </div>
  );
}

export default PhotoLibrary;
