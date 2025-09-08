import { useState } from 'react';
import albumsJson from '../../../portfolio/src/assets/album.json';
import galleryJson from '../../../portfolio/src/assets/gallery.json';
import tagJson from '../../../portfolio/src/assets/tag.json';

export default function ExportPage() {
  const [error, setError] = useState('');
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState('');

  const onCopyGallery = async () => {
    try {
      setCopying(true);
      setCopied('');
      const res = await fetch('/api/export/copy-gallery', { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCopied(`Copié ${data.copiedFiles} fichier(s).`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="p-4 text-white flex flex-col gap-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Export JSON</h1>
        <button
          onClick={onCopyGallery}
          disabled={copying}
          className="px-3 py-2 rounded bg-gray-500 hover:bg-gray-400"
        >
          Envoyer vers portfolio
        </button>
      </div>
      {copied && <div className="mb-3 text-green-300">{copied}</div>}
      {error && <div className="mb-3 text-red-300">{error}</div>}

      <details className="border-2 border-white rounded-2xl p-4 " open>
        <summary className="cursor-pointer select-none">albums.json</summary>
        <pre className="bg-gray-800 rounded p-3 overflow-auto text-xs">
          {JSON.stringify(albumsJson ?? [], null, 2)}
        </pre>
      </details>
      <details className="border-2 border-white rounded-2xl p-4 ">
        <summary className="cursor-pointer select-none">tags.json</summary>
        <pre className="bg-gray-800 rounded p-3 overflow-auto text-xs">
          {JSON.stringify(tagJson ?? [], null, 2)}
        </pre>
      </details>
      <details className="border-2 border-white rounded-2xl p-4 ">
        <summary className="cursor-pointer select-none">gallery.json</summary>
        <pre className="bg-gray-800 rounded p-3 overflow-auto text-xs">
          {JSON.stringify(galleryJson ?? [], null, 2)}
        </pre>
      </details>
    </div>
  );
}
