import type { ReactNode } from 'react'

type MenuProps = {
  children: ReactNode
}


function SideMenu({children}: MenuProps) {
    return (
        <nav className='flex pt-11 flex-col relative h-dvh w-48 bg-gray-600 border-r border-gray-200'>
            <div className="deco absolute top-0 left-0 ">
                <div className="flex gap-2 p-5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12">
                        <circle cx="6" cy="6" r="6" fill="#ff5f57" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12">
                        <circle cx="6" cy="6" r="6" fill="#febc2e" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12">
                        <circle cx="6" cy="6" r="6" fill="#28c840" />
                    </svg>
                </div>
            </div>
            {children}
        </nav>
    )
}

export default SideMenu