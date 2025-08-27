import type { ReactNode } from 'react'
type CategoryMenuProps = {
  name: string
  children: ReactNode
}


function CategoryMenu({children, name}: CategoryMenuProps) {
    return (
        <div className="pt-2.5 px-2">
            <span className="text-xs font-medium pl-1 text-gray-400">{name}</span>
            {children}
        </div>
    )
}

export default CategoryMenu