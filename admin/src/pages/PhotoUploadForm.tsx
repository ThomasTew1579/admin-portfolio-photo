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
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm mb-1">Photo</label>
        <input type="file" accept="image/*" onChange={onFileChange} />
      </div>

      {form.previewUrl && (
        <img src={form.previewUrl} alt="preview" style={{ maxWidth: 240, borderRadius: 8 }} />
      )}

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
        <label className="block text-sm mb-1">Album</label>
        <select
          className="border px-2 py-1 rounded"
          value={form.albumId}
          onChange={(e) => set('albumId', e.target.value)}
        >
          {albums.map((a) => (
            <option key={a.albumId} value={a.albumId}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm mb-1">Tag</label>
        <select
          className="border px-2 py-1 rounded"
          value={form.tagId}
          onChange={(e) => set('tagId', e.target.value)}
        >
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
  );
}
