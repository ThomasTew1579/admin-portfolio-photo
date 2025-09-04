import type { ReactNode } from 'react';
type CategoryMenuProps = {
  name: string;
  className?: string;
  children: ReactNode;
};

function CategoryMenu({ children, className, name }: CategoryMenuProps) {
  return (
    <div className={'pt-2.5 px-2 ' + className}>
      <span className="text-xs font-medium pl-1 text-gray-100">{name}</span>
      {children}
    </div>
  );
}

export default CategoryMenu;
