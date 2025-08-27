import MenuItems from "./components/MenuItems"
import SideMenu from "./components/SideMenu"
import CategoryMenu from "./components/CategoryMenu"

function Admin() {

  return (
    <>
      <SideMenu>
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
      </SideMenu>

  
    </>
  )
}

export default Admin
