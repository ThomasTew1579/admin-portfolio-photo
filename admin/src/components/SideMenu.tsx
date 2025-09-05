import CategoryMenu from './CategoryMenu';
import MenuItems from './MenuItems';
import SubMenuItems from './SubMenuItems';
import albumsJson from '../assets/album.json';
import tagsJson from '../assets/tag.json';
import MenuDecoration from './MenuDecoration';
import type { Album, Tag } from '../types/type';

const tags = tagsJson as Tag[];
const albums = albumsJson as Album[];

function SideMenu() {
  return (
    <nav className="flex z-50 fixed pt-11 flex-col h-dvh w-sidebar bg-gray-600 border-r border-gray-300">
      <MenuDecoration />
      <CategoryMenu name="Photos">
        <MenuItems title="Photothèque" href="/" icon="images"></MenuItems>
        <MenuItems title="Albums" href="/albums" icon="folder-open">
          {albums.map((a) => (
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
        {tags.map((t) => (
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
