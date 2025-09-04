import { useState } from "react";
import * as exifr from "exifr";

type FormState = {
  filename: string;
  date: string;      // "YYYY-MM-DD"
  file: File | null;
  previewUrl?: string;
};

export default function PhotoUploadForm() {
  const [form, setForm] = useState<FormState>({
    filename: "",
    date: "",
    file: null,
  });
  const [status, setStatus] = useState<null | string>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Préremplissage : filename (sans extension) + date EXIF si dispo
    const base = file.name.replace(/\.[^.]+$/, "");
    let dateStr = "";

    try {
      // EXIF : surtout présent sur JPEG/HEIC. WebP en a rarement.
      const meta = await exifr.parse(file).catch(() => null);
      const exifDate: Date | undefined =
        (meta?.DateTimeOriginal as Date) ||
        (meta?.CreateDate as Date) ||
        (meta?.ModifyDate as Date);

      if (exifDate instanceof Date && !isNaN(+exifDate)) {
        dateStr = exifDate.toISOString().slice(0, 10);
      } else {
        // fallback: dernière modif du fichier
        dateStr = new Date(file.lastModified).toISOString().slice(0, 10);
      }
    } catch {
      dateStr = new Date(file.lastModified).toISOString().slice(0, 10);
    }

    const previewUrl = URL.createObjectURL(file);

    setForm({
      filename: base,
      date: dateStr,
      file,
      previewUrl,
    });
  }

  function onChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.file) {
      setStatus("Please select a photo first.");
      return;
    }

    setStatus("Uploading…");
    const fd = new FormData();
    fd.append("photo", form.file);
    fd.append("filename", form.filename);
    fd.append("date", form.date);

    const res = await fetch("/api/photos", {
      method: "POST",
      body: fd,
    });

    if (!res.ok) {
      const msg = await res.text();
      setStatus(`Upload failed: ${msg}`);
      return;
    }

    const data = await res.json();
    setStatus(`Saved ✓ (${data.entry.path})`);
    // option: reset le form
    // setForm({ filename: "", date: "", file: null });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm mb-1">Photo</label>
        <input type="file" accept="image/*" onChange={onFileChange} />
      </div>

      {form.previewUrl && (
        <img
          src={form.previewUrl}
          alt="preview"
          style={{ maxWidth: 240, borderRadius: 8 }}
        />
      )}

      <div>
        <label className="block text-sm mb-1">Filename (without extension)</label>
        <input
          className="border px-2 py-1 rounded w-full"
          value={form.filename}
          onChange={e => onChange("filename", e.target.value)}
          placeholder="my-awesome-photo"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Date</label>
        <input
          type="date"
          className="border px-2 py-1 rounded"
          value={form.date}
          onChange={e => onChange("date", e.target.value)}
        />
      </div>

      <button type="submit" className="px-3 py-2 rounded bg-blue-600 text-white">
        Save photo
      </button>

      {status && <p className="text-sm text-gray-600">{status}</p>}
    </form>
  );
}