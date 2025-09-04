import { NavLink, type NavLinkProps } from 'react-router-dom';
import { useState, type ReactNode } from 'react';
import Icon from './Icon';

type MenuItemProps = {
  children?: ReactNode;
  title: string;
  icon?: string;
  href?: string;
  onClick?: () => void;
};

function MenuItems({ children, title, icon = 'arrow-right', href, onClick }: MenuItemProps) {
  const baseClass =
    'block px-3 pl-10 py-1.5 text-sm font-medium w-full text-start rounded-md text-white ';
  const inactiveClass = 'opacity-90';
  const activeClass = 'bg-gray-300/60';

  const [isOpen, setIsOpen] = useState(false);

  const toggleIsOpen = () => setIsOpen((prev) => !prev);

  if (href) {
    const isExternal = /^https?:\/\//.test(href);
    if (isExternal) {
      return (
        <li className="list-none relative">
          <a className={baseClass + inactiveClass} href={href} target="_blank" rel="noreferrer">
            <Icon name={icon} size={14} className="absolute z-10 top-2 left-5 fill-primary" />
            {title}
          </a>
        </li>
      );
    }

    const linkClassName: NavLinkProps['className'] = ({ isActive }) =>
      baseClass + (isActive ? activeClass : inactiveClass);
    if (children !== undefined) {
      return (
        <li className="list-none relative">
          <button
            onClick={toggleIsOpen}
            className="absolute z-10 top-2 left-0 fill-white p-0.5 w-4 h-4 cursor-pointer"
          >
            <Icon
              name="chevron-right"
              size={10}
              className={'duration-200' + (isOpen ? ' rotate-90' : '')}
            />
          </button>
          <div className="menu-item-has-children">
            <NavLink to={href} end={href === '/'} className={linkClassName}>
              <Icon name={icon} size={14} className="absolute z-10 top-2 left-5 fill-primary" />
              {title}
            </NavLink>
          </div>
          <ul
            className={
              'sub-menu-items pl-4 overflow-clip h-0 ' + (isOpen ? 'h-full' : 'pointer-events-none')
            }
          >
            {children}
          </ul>
        </li>
      );
    } else {
      return (
        <li className="list-none relative">
          <NavLink to={href} end={href === '/'} className={linkClassName}>
            <Icon name={icon} size={14} className="absolute z-10 top-2 left-5 fill-primary" />
            {title}
          </NavLink>
        </li>
      );
    }
  }
  return (
    <li className="list-none relative">
      <Icon name={icon} size={14} className="absolute z-10 top-2 left-3 fill-primary" />
      <button className={baseClass + inactiveClass} onClick={onClick}>
        {title} <span className="text-xs opacity-35">nolink</span>
      </button>
    </li>
  );
}

export default MenuItems;
