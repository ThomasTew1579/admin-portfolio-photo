import { Routes, Route } from 'react-router-dom';
import type { ViewportConfig } from './types/type';
import { Suspense, lazy } from 'react';

import SideMenu from './components/SideMenu';
import TopMenu from './components/TopMenu';
const PhotoLibrary = lazy(() => import('./pages/PhotoLibrary'));
const PhotoUploadForm = lazy(() => import('./pages/PhotoUploadForm'));
const Albums = lazy(() => import('./pages/Albums'));
const ExportPage = lazy(() => import('./pages/Export'));
const AlbumSingle = lazy(() => import('./pages/AlbumSingle'));
const TagSingle = lazy(() => import('./pages/TagSingle'));

import { useState } from 'react';

function Admin() {
  const [viewportConfig, setViewportConfig] = useState<ViewportConfig>({
    grid: 220,
    objectFit: true,
  });

  const toggleObjectFit = () =>
    setViewportConfig((prev) => ({ ...prev, objectFit: !prev.objectFit }));

  const changeGrid = (n: number) => setViewportConfig((prev) => ({ ...prev, grid: n }));

  function Fallback() {
    return <div className="p-6 text-center text-white">Chargement…</div>;
  }

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
        <Suspense fallback={<Fallback />}>
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
            <Route
              path="/tag"
              element={
                <TagSingle grid={viewportConfig.grid} objectFit={viewportConfig.objectFit} />
              }
            />
            <Route path="/export" element={<ExportPage />} />
          </Routes>
        </Suspense>
      </div>
    </>
  );
}

export default Admin;
