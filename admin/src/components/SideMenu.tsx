import CategoryMenu from './CategoryMenu';
import MenuItems from './MenuItems';
import SubMenuItems from './SubMenuItems';
import { useAlbumsTags } from '../hook/useAlbumsTags';

function SideMenu() {
  const { albums, tags, loading, error } = useAlbumsTags();

  return (
    <nav className="flex z-50 fixed pt-11 flex-col h-dvh w-sidebar bg-gray-600 border-r border-gray-300">
      <MenuDecoration />
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
