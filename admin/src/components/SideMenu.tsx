import CategoryMenu from './CategoryMenu'
import MenuItems from './MenuItems'

function SideMenu() {
    return (
        <nav className='flex fixed pt-11 flex-col h-dvh w-48 bg-gray-600 border-r border-gray-200'>
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
            <CategoryMenu name="Photos">
                <MenuItems icon="images">Photothèque</MenuItems>
                <MenuItems icon="folder-open">Album</MenuItems>
                <MenuItems icon="arrow-down-to-square">Import</MenuItems>
            </CategoryMenu>
            <CategoryMenu name="tags">
                <MenuItems icon="tag">Skate</MenuItems>
                <MenuItems icon="tag">Live</MenuItems>
                <MenuItems icon="tag">Autre</MenuItems>
            </CategoryMenu>
            <CategoryMenu name="Réglages" className="mt-auto pb-2">
                <MenuItems icon="code">Export JSON</MenuItems>
            </CategoryMenu>
        </nav>
    )
}

export default SideMenu