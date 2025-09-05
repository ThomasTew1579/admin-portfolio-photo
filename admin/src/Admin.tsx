import { Routes, Route } from 'react-router-dom';
import type { ViewportConfig } from './types/type';

import SideMenu from './components/SideMenu';
import TopMenu from './components/TopMenu';
import PhotoLibrary from './pages/PhotoLibrary';
import PhotoUploadForm from './pages/PhotoUploadForm';
import Albums from './pages/Albums';
import AlbumSingle from './pages/AlbumSingle';
import { useState } from 'react';

function Admin() {
  const [viewportConfig, setViewportConfig] = useState<ViewportConfig>({
    grid: 220,
    objectFit: false,
  });

  const toggleObjectFit = () =>
    setViewportConfig((prev) => ({ ...prev, objectFit: !prev.objectFit }));

  const changeGrid = (n: number) => setViewportConfig((prev) => ({ ...prev, grid: n }));

  return (
    <>
      <SideMenu />
      <TopMenu
        fit={viewportConfig.objectFit}
        grid={viewportConfig.grid}
        onToggleFit={toggleObjectFit}
        onGridChange={changeGrid}
      />

      <div className="viewport pl-sidebar pt-topbar">
        <Routes>
          <Route
            path="/"
            element={
              <PhotoLibrary grid={viewportConfig.grid} objectFit={viewportConfig.objectFit} />
            }
          />
          <Route path="/upload" element={<PhotoUploadForm />} />
          <Route path="/albums" element={<Albums />} />
          <Route
            path="/album"
            element={
              <AlbumSingle grid={viewportConfig.grid} objectFit={viewportConfig.objectFit} />
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default Admin;
