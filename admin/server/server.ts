import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());
app.use(express.json());

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [k: string]: JsonValue };
type Album = { name: string; desc?: string; albumId: string; tagId: string };
type GalleryItem = {
  filename: string;
  path: string;
  thumbnailPath: string;
  year: number;
  month: number;
  day: number;
  albumId: string;
  TagId: string;
  id: string;
};

const PUBLIC_GALLERY_DIR = path.resolve(process.cwd(), 'public', 'gallery');
const GALLERY_JSON = path.resolve(process.cwd(), 'src', 'assets', 'gallery.json');
const ALBUM_JSON = path.resolve(process.cwd(), 'src', 'assets', 'album.json');
const TAG_JSON = path.resolve(process.cwd(), 'src', 'assets', 'tag.json');

fs.mkdirSync(PUBLIC_GALLERY_DIR, { recursive: true });

function readJson<T>(file: string, fallback: T): T {
  try {
    const raw = fs.readFileSync(file, 'utf-8');
    return raw.trim() ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeJson(file: string, data: JsonValue) {
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmp, file);
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, PUBLIC_GALLERY_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const base = String(req.body?.filename || path.basename(file.originalname, ext))
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

app.get('/api/albums', (_req, res) => {
  const albums = readJson<Album[]>(ALBUM_JSON, []);
  const norm = albums.map((a) => ({
    name: a.name,
    desc: a.desc,
    albumId: a.albumId,
  }));
  res.json(norm);
});

app.get('/api/tags', (_req, res) => {
  const tags = readJson<Album[]>(TAG_JSON, []);
  const norm = tags.map((t) => ({
    name: t.name,
    desc: t.desc,
    tagId: t.tagId ?? t.albumId,
  }));
  res.json(norm);
});

app.post('/api/photos', upload.single('photo'), (req, res) => {
  try {
    if (!req.file) return res.status(400).send('No file uploaded.');

    const filename = req.file.filename;
    const year = parseInt(String(req.body.year), 10) || new Date().getFullYear();
    const month = parseInt(String(req.body.month), 10) || new Date().getMonth() + 1;
    const day = parseInt(String(req.body.day), 10) || new Date().getDate();
    const albumId = String(req.body.albumId || '');
    const tagId = String(req.body.tagId || '');

    const albums = readJson<Album[]>(ALBUM_JSON, []);
    const tags = readJson<Album[]>(TAG_JSON, []);
    const albumExists = albums.some((a) => a.albumId === albumId);
    const tagExists = tags.some((t) => t.tagId === tagId);

    if (!albumExists) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ ok: false, reason: 'unknown-albumId' });
    }
    if (!tagExists) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ ok: false, reason: 'unknown-TagId' });
    }

    const entry = {
      filename,
      path: `./gallery/${filename}`,
      thumbnailPath: '',
      year,
      month,
      day,
      albumId,
      TagId: tagId,
      id: uuidv4(),
    };

    const gallery = readJson<GalleryItem[]>(GALLERY_JSON, []);
    const dup = gallery.find((e) => e.filename === entry.filename || e.path === entry.path);
    if (dup) {
      fs.unlinkSync(req.file.path);
      return res.status(409).json({ ok: false, reason: 'duplicate', conflictWith: dup });
    }

    gallery.push(entry);
    writeJson(GALLERY_JSON, gallery);

    res.json({ ok: true, entry });
  } catch (e: unknown) {
    console.error(e);
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).send(msg || 'Server error');
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
