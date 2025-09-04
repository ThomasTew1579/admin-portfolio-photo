import { NavLink, type NavLinkProps } from 'react-router-dom';
import Icon from './Icon';

type MenuItemProps = {
  title: string;
  icon?: string;
  href?: string;
  onClick?: () => void;
};

function SubMenuItems({ title, icon = 'images', href, onClick }: MenuItemProps) {
  const baseClass =
    'block px-3 pl-8.5 py-1.5 text-sm font-medium w-full text-start rounded-md text-white ';
  const inactiveClass = 'opacity-90';
  const activeClass = 'bg-gray-300/60';

  if (href) {
    const isExternal = /^https?:\/\//.test(href);
    if (isExternal) {
      return (
        <li className="list-none relative">
          <Icon name={icon} size={14} className="absolute z-10 top-2 left-3 fill-gray-100" />
          <a className={baseClass + inactiveClass} href={href} target="_blank" rel="noreferrer">
            {title}
          </a>
        </li>
      );
    }

    const linkClassName: NavLinkProps['className'] = ({ isActive }) =>
      baseClass + (isActive ? activeClass : inactiveClass);

    return (
      <li className="list-none relative">
        <Icon name={icon} size={14} className="absolute z-10 top-2 left-3 fill-gray-100" />
        <NavLink to={href} end={href === '/'} className={linkClassName}>
          {title}
        </NavLink>
      </li>
    );
  }
  return (
    <li className="list-none relative">
      <Icon name={icon} size={14} className="absolute z-10 top-2 left-3 fill-gray-100" />
      <button className={baseClass + inactiveClass} onClick={onClick}>
        {title}
      </button>
    </li>
  );
}

export default SubMenuItems;
