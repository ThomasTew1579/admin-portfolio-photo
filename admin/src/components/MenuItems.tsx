import { NavLink, type NavLinkProps } from 'react-router-dom';
import type { ReactNode } from 'react';
import Icon from './Icon';

type MenuItemProps = {
  children: ReactNode;
  icon?: string;
  href?: string;
  onClick?: () => void;
};

function MenuItems({ children, icon = 'arrow-right', href, onClick }: MenuItemProps) {
  const baseClass =
    'block px-3 pl-8.5 py-1.5 text-sm font-medium w-full text-start rounded-md text-white ';
  const inactiveClass = 'opacity-90';
  const activeClass = 'bg-gray-300/60';

  if (href) {
    const isExternal = /^https?:\/\//.test(href);
    if (isExternal) {
      return (
        <li className="list-none relative">
          <Icon name={icon} size={14} className="absolute z-10 top-2 left-3 fill-primary" />
          <a className={baseClass + inactiveClass} href={href} target="_blank" rel="noreferrer">
            {children}
          </a>
        </li>
      );
    }

    const linkClassName: NavLinkProps['className'] = ({ isActive }) =>
      baseClass + (isActive ? activeClass : inactiveClass);
    return (
      <li className="list-none relative">
        <Icon name={icon} size={14} className="absolute z-10 top-2 left-3 fill-primary" />
        <NavLink to={href} end={href === '/'} className={linkClassName}>
          {children}
        </NavLink>
      </li>
    );
  }
  return (
    <li className="list-none relative">
      <Icon name={icon} size={14} className="absolute z-10 top-2 left-3 fill-primary" />
      <button className={baseClass + inactiveClass} onClick={onClick}>
        {children}
      </button>
    </li>
  );
}

export default MenuItems;
