import { useEffect, useState } from 'react';
import * as exifr from 'exifr';
import type { Album, Tag, FormState } from '../types/type';

export default function PhotoUploadForm() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    file: null,
    filename: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
    albumId: '',
    tagId: '',
  });

  useEffect(() => {
    (async () => {
      const [a, t] = await Promise.all([
        fetch('/api/albums').then((r) => r.json()),
        fetch('/api/tags').then((r) => r.json()),
      ]);
      setAlbums(a);
      setTags(t);
      setForm((prev) => ({
        ...prev,
        albumId: a?.[0]?.albumId ?? '',
        tagId: t?.[0]?.tagId ?? '',
      }));
    })();
  }, []);

  function clearForm() {
    setForm(() => ({
      file: null,
      filename: '',
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate(),
      albumId: '',
      tagId: '',
    }));
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const base = file.name.replace(/\.[^.]+$/, '');
    let y = form.year,
      m = form.month,
      d = form.day;

    try {
      const meta = await exifr.parse(file).catch(() => null);
      const exifDate: Date | undefined =
        (meta?.DateTimeOriginal as Date) ||
        (meta?.CreateDate as Date) ||
        (meta?.ModifyDate as Date);
      const dt =
        exifDate instanceof Date && !isNaN(+exifDate) ? exifDate : new Date(file.lastModified);
      y = dt.getFullYear();
      m = dt.getMonth() + 1;
      d = dt.getDate();
    } catch {
      const dt = new Date(file.lastModified);
      y = dt.getFullYear();
      m = dt.getMonth() + 1;
      d = dt.getDate();
    }

    setForm((prev) => ({
      ...prev,
      file,
      previewUrl: URL.createObjectURL(file),
      filename: base,
      year: y,
      month: m,
      day: d,
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.file) {
      setStatus('Please choose a photo first.');
      return;
    }
    setStatus('Uploading…');

    const fd = new FormData();
    fd.append('photo', form.file);
    fd.append('filename', form.filename);
    fd.append('year', String(form.year));
    fd.append('month', String(form.month));
    fd.append('day', String(form.day));
    fd.append('albumId', form.albumId);
    fd.append('tagId', form.tagId);

    const res = await fetch('/api/photos', { method: 'POST', body: fd });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setStatus(`Upload failed: ${data?.reason ?? res.statusText}`);
      return;
    }
    setStatus(`Saved ✓ ${data?.entry?.path ?? ''}`);
    clearForm();
  }

  return (
    <div className="upload-photo">
      <div className="head py-2 px-3 border-b-2">
        <h1 className="text-3xl text-white font-semibold mb-4">Import photo</h1>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 text-gray-100 px-18 py-6">

        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
            {form.previewUrl && (
              <img src={form.previewUrl} alt="preview" style={{maxHeight: 240, borderRadius: 8 }} />
            )}
            {!form.previewUrl && (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  SVG, PNG, JPG or GIF (MAX. 800x400px)
                </p>
              </div>
            )}

            <input id="dropzone-file" type="file" className="hidden" onChange={onFileChange} />
          </label>
        </div>

        <div>
          <label className="block text-sm mb-1">Filename (without extension)</label>
          <input
            className="border px-2 py-1 rounded w-full"
            value={form.filename}
            onChange={(e) => set('filename', e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <div>
            <label className="block text-sm mb-1">Year</label>
            <input
              type="number"
              className="border px-2 py-1 rounded w-24"
              value={form.year}
              onChange={(e) => set('year', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Month</label>
            <input
              type="number"
              className="border px-2 py-1 rounded w-20"
              min={1}
              max={12}
              value={form.month}
              onChange={(e) => set('month', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Day</label>
            <input
              type="number"
              className="border px-2 py-1 rounded w-20"
              min={1}
              max={31}
              value={form.day}
              onChange={(e) => set('day', Number(e.target.value))}
            />
          </div>
        </div>

        <div>
          <select
            id="album-select"
            className="border px-2 py-1 rounded"
            value=""
            onChange={(e) => set('albumId', e.target.value)}
          >
            <option value="">-Album-</option>
            {albums.map((a) => (
              <option key={a.albumId} value={a.albumId}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            className="border px-2 py-1 rounded"
            value=""
            onChange={(e) => set('tagId', e.target.value)}
          >
            <option value="">-Tag-</option>
            {tags.map((t) => (
              <option key={t.tagId} value={t.tagId}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="px-3 py-2 rounded bg-blue-600 text-white">
          Save photo
        </button>

        {status && <p className="text-sm text-gray-600">{status}</p>}
      </form>
    </div>
  );
}
