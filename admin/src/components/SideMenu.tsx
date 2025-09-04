import CategoryMenu from './CategoryMenu';
import MenuItems from './MenuItems';
import SubMenuItems from './SubMenuItems';
import { useAlbumsTags } from '../hook/useAlbumsTags';

function SideMenu() {
  const { albums, tags, loading, error } = useAlbumsTags();

  return (
    <nav className="flex z-50 fixed pt-11 flex-col h-dvh w-sidebar bg-gray-600 border-r border-gray-300">
      <div className="deco absolute top-0 left-0 ">
        <div className="flex gap-2 p-5 group">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12">
            <circle cx="6" cy="6" r="6" fill="#ff5f57" />
            <use
              className="group-hover:flex hidden"
              href="sprite/far.svg#xmark"
              width="10"
              height="10"
              x="1.1"
              y="1.1"
              fill="#2626269c"
            />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12">
            <circle cx="6" cy="6" r="6" fill="#febc2e" />
            <use
              className="group-hover:flex hidden"
              href="sprite/far.svg#minus"
              width="10"
              height="10"
              x="1.1"
              y="1.1"
              fill="#2626269c"
            />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12">
            <circle cx="6" cy="6" r="6" fill="#28c840" />
            <svg
              className="group-hover:flex hidden"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 385 380"
              width="9"
              height="9"
              x="1.2"
              y="1.2"
              fill="#2626269c"
            >
              <path d="m24 188h144c13.3 0 24 10.7 24 24v144c0 9.7-5.8 18.5-14.8 22.2-9 3.7-19.3 1.7-26.2-5.2l-39-39-59.8-58.6-6.1-7.3-39-39c-6.9-6.9-8.9-17.2-5.2-26.2 3.7-9 12.4-14.9 22.1-14.9z" />
              <path d="m361 192h-144c-13.3 0-24-10.7-24-24v-144c0-9.7 5.8-18.5 14.8-22.2 9-3.7 19.3-1.7 26.2 5.2l39 39 59.8 58.6 6.1 7.3 39 39c6.9 6.9 8.9 17.2 5.2 26.2-3.7 9-12.4 14.9-22.1 14.9z" />
            </svg>
          </svg>
        </div>
      </div>
      <CategoryMenu name="Photos">
        <MenuItems title="Photothèque" href="/" icon="images"></MenuItems>
        <MenuItems title="Albums" href="/albums" icon="folder-open">
          {loading && <li className="list-none px-3 py-1 text-xs opacity-70">Chargement…</li>}
          {error && (
            <li className="list-none px-3 py-1 text-xs text-red-300">
              Erreur de chargement des albums
            </li>
          )}
          {!loading &&
            !error &&
            albums.map((a) => (
              <SubMenuItems
                key={a.albumId}
                title={a.name}
                icon="images"
                href={`/album?title=${a.name}`}
              />
            ))}
        </MenuItems>
        <MenuItems title="Import" href="/upload" icon="arrow-down-to-square"></MenuItems>
      </CategoryMenu>
      <CategoryMenu name="tags">
        {loading && <li className="list-none px-3 py-1 text-xs opacity-70">Chargement…</li>}
        {error && (
          <li className="list-none px-3 py-1 text-xs text-red-300">Erreur de chargement</li>
        )}
        {!loading &&
          !error &&
          tags.map((t) => (
            <MenuItems key={t.tagId} title={t.name} icon="tag" href={`/tag?title=${t.name}`} />
          ))}
      </CategoryMenu>
      <CategoryMenu name="Réglages" className="mt-auto pb-2">
        <MenuItems title="Export JSON" icon="code"></MenuItems>
      </CategoryMenu>
    </nav>
  );
}

export default SideMenu;
