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
  TagId: string; // casse respectée comme dans ton JSON
  id: string;
};

/** Emplacements demandés */
const PUBLIC_GALLERY_DIR = path.resolve(process.cwd(), 'public', 'gallery');
const GALLERY_JSON = path.resolve(process.cwd(), 'src', 'assets', 'gallery.json');
const ALBUM_JSON = path.resolve(process.cwd(), 'src', 'assets', 'album.json');
const TAG_JSON = path.resolve(process.cwd(), 'src', 'assets', 'tag.json');

fs.mkdirSync(PUBLIC_GALLERY_DIR, { recursive: true });

/** Helpers lecture/écriture JSON */
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
  fs.renameSync(tmp, file); // écriture atomique
}

/** Multer: stocke directement dans /public/gallery */
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

/** GET pour alimenter les selects */
app.get('/api/albums', (_req, res) => {
  const albums = readJson<Album[]>(ALBUM_JSON, []);
  // validation minimale
  const norm = albums.map((a) => ({
    name: a.name,
    desc: a.desc,
    albumId: a.albumId,
  }));
  res.json(norm);
});

app.get('/api/tags', (_req, res) => {
  const tags = readJson<Album[]>(TAG_JSON, []);
  // ton exemple de tag a un champ "albumId" (sans doute une coquille) → on normalise en tagId
  const norm = tags.map((t) => ({
    name: t.name,
    desc: t.desc,
    tagId: t.tagId ?? t.albumId, // fallback si ton fichier a la coquille
  }));
  res.json(norm);
});

/** POST import photo : met à jour gallery.json + vérifie album/tag */
app.post('/api/photos', upload.single('photo'), (req, res) => {
  try {
    if (!req.file) return res.status(400).send('No file uploaded.');

    // Champs reçus
    const filename = req.file.filename;
    const year = parseInt(String(req.body.year), 10) || new Date().getFullYear();
    const month = parseInt(String(req.body.month), 10) || new Date().getMonth() + 1;
    const day = parseInt(String(req.body.day), 10) || new Date().getDate();
    const albumId = String(req.body.albumId || '');
    const tagId = String(req.body.tagId || ''); // casse respectée

    // Valider que les IDs existent
    const albums = readJson<Album[]>(ALBUM_JSON, []);
    const tags = readJson<Album[]>(TAG_JSON, []);
    const albumExists = albums.some((a) => a.albumId === albumId);
    // tag peut être dans tagId ou albumId (coquille), on accepte les deux
    const tagExists = tags.some((t) => t.tagId === tagId);

    if (!albumExists) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ ok: false, reason: 'unknown-albumId' });
    }
    if (!tagExists) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ ok: false, reason: 'unknown-TagId' });
    }

    // Construire l'entrée gallery
    const entry = {
      filename, // ex: "my-name-16934444.jpg"
      path: `./gallery/${filename}`, // 👈 conforme à ton schéma
      thumbnailPath: '', // à remplir plus tard si tu génères des thumbs
      year,
      month,
      day,
      albumId,
      TagId: tagId,
      id: uuidv4(),
    };

    // Dédup légère (filename/path)
    const gallery = readJson<GalleryItem[]>(GALLERY_JSON, []);
    const dup = gallery.find((e) => e.filename === entry.filename || e.path === entry.path);
    if (dup) {
      fs.unlinkSync(req.file.path);
      return res.status(409).json({ ok: false, reason: 'duplicate', conflictWith: dup });
    }

    // Append et sauvegarde
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
