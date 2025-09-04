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
type Album = { name: string; desc?: string; albumId: string };
type GalleryItem = {
  filename: string;
  path: string;
  thumbnailPath: string;
  year: number;
  month: number;
  day: number;
  albumId: string;
  tagId: string;
  id: string;
};
type Tag = { name: string; desc?: string; tagId: string };

const PUBLIC_GALLERY_DIR = path.resolve(process.cwd(), 'public', 'gallery');
const GALLERY_JSON = path.resolve(process.cwd(), 'src', 'assets', 'gallery.json');
const ALBUM_JSON = path.resolve(process.cwd(), 'src', 'assets', 'album.json');
const TAG_JSON = path.resolve(process.cwd(), 'src', 'assets', 'tag.json');

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const absFromGalleryRel = (relPath: string) => {
  const file = path.basename(relPath);
  return path.join(PUBLIC_GALLERY_DIR, file);
};

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

// PATCH /api/photos/:id
// body possible: { filenameBase?, year?, month?, day?, albumId?, tagId? }
app.patch('/api/photos/:id', (req, res) => {
  try {
    const id = String(req.params.id);
    const gallery = readJson<GalleryItem[]>(GALLERY_JSON, [] as GalleryItem[]);
    const idx = gallery.findIndex((g) => g.id === id);
    if (idx === -1) return res.status(404).send('photo-not-found');

    const current = gallery[idx];
    const updated: GalleryItem = { ...current };

    const filenameBase =
      typeof req.body.filenameBase === 'string' ? req.body.filenameBase.trim() : '';
    if (filenameBase) {
      const ext = path.extname(current.filename) || '.jpg';
      const nextFilename = `${slug(filenameBase)}${ext}`;
      const nextPathRel = `./gallery/${nextFilename}`;

      const duplicate = gallery.some(
        (g) => (g.filename === nextFilename || g.path === nextPathRel) && g.id !== id
      );
      if (duplicate) return res.status(409).json({ ok: false, reason: 'duplicate-name' });

      const oldAbs = absFromGalleryRel(current.path);
      const nextAbs = path.join(PUBLIC_GALLERY_DIR, nextFilename);
      fs.renameSync(oldAbs, nextAbs);

      if (current.thumbnailPath) {
        const oldThumbAbs = absFromGalleryRel(current.thumbnailPath);
        const nextThumbFilename = `${slug(filenameBase)}-thumb${path.extname(current.thumbnailPath) || '.jpg'}`;
        const nextThumbAbs = path.join(PUBLIC_GALLERY_DIR, nextThumbFilename);
        try {
          fs.renameSync(oldThumbAbs, nextThumbAbs);
          updated.thumbnailPath = `./gallery/${nextThumbFilename}`;
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          res.status(500).send(msg);
        }
      }

      updated.filename = nextFilename;
      updated.path = nextPathRel;
    }

    const toInt = (v: unknown) => Number.parseInt(String(v ?? ''), 10);
    if (req.body.year != null) updated.year = toInt(req.body.year) || updated.year;
    if (req.body.month != null) updated.month = toInt(req.body.month) || updated.month;
    if (req.body.day != null) updated.day = toInt(req.body.day) || updated.day;

    if (req.body.albumId !== undefined) {
      const albumId = String(req.body.albumId).trim();
      if (albumId) {
        const albums = readJson<Album[]>(ALBUM_JSON, [] as Album[]);
        if (!albums.some((a) => a.albumId === albumId)) {
          return res.status(400).json({ ok: false, reason: 'unknown-albumId' });
        }
        updated.albumId = albumId;
      } else {
        updated.albumId = '';
      }
    }

    // 4) Tag
    if (req.body.tagId !== undefined) {
      const tagId = String(req.body.tagId).trim();
      if (tagId) {
        const tags = readJson<Tag[]>(TAG_JSON, [] as Tag[]);
        if (!tags.some((t) => t.tagId === tagId)) {
          return res.status(400).json({ ok: false, reason: 'unknown-tagId' });
        }
        updated.tagId = tagId;
      } else {
        updated.tagId = '';
      }
    }

    // Persist
    gallery[idx] = updated;
    writeJson(GALLERY_JSON, gallery);
    res.json({ ok: true, entry: updated });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).send(msg || 'Server error');
  }
});

// PATCH /api/albums/:albumId
// body: { name?, desc?, replaceId? }  (replaceId pour migrer toutes les photos)
app.patch('/api/albums/:albumId', (req, res) => {
  try {
    const albumId = String(req.params.albumId).trim();
    const albums = readJson<Album[]>(ALBUM_JSON, [] as Album[]);
    const i = albums.findIndex((a) => a.albumId === albumId);
    if (i === -1) return res.status(404).send('album-not-found');

    const body = req.body ?? {};
    const replaceId = body.replaceId ? String(body.replaceId).trim() : '';

    if (typeof body.name === 'string') albums[i].name = body.name;
    if (typeof body.desc === 'string' || body.desc === null)
      albums[i].desc = body.desc ?? undefined;

    if (replaceId && replaceId !== albumId) {
      if (albums.some((a) => a.albumId === replaceId)) {
        return res.status(409).json({ ok: false, reason: 'albumId-already-exists' });
      }
      albums[i].albumId = replaceId;

      const gallery = readJson<GalleryItem[]>(GALLERY_JSON, [] as GalleryItem[]);
      let affected = 0;
      for (const g of gallery) {
        if (g.albumId === albumId) {
          g.albumId = replaceId;
          affected++;
        }
      }
      writeJson(GALLERY_JSON, gallery);
      writeJson(ALBUM_JSON, albums);
      return res.json({ ok: true, album: albums[i], migratedPhotos: affected });
    }

    writeJson(ALBUM_JSON, albums);
    res.json({ ok: true, album: albums[i] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).send(msg || 'Server error');
  }
});

// DELETE /api/albums/:albumId
// Effet: supprime l'album.json ciblé + met albumId="" dans toutes les photos liées
app.delete('/api/albums/:albumId', (req, res) => {
  try {
    const albumId = String(req.params.albumId).trim();

    const albums = readJson<Album[]>(ALBUM_JSON, [] as Album[]);
    const exists = albums.some((a) => a.albumId === albumId);
    if (!exists) return res.status(404).send('album-not-found');

    const kept = albums.filter((a) => a.albumId !== albumId);
    writeJson(ALBUM_JSON, kept);

    const gallery = readJson<GalleryItem[]>(GALLERY_JSON, [] as GalleryItem[]);
    let affected = 0;
    for (const g of gallery) {
      if (g.albumId === albumId) {
        g.albumId = '';
        affected++;
      }
    }
    writeJson(GALLERY_JSON, gallery);

    res.json({ ok: true, removedAlbumId: albumId, unlinkedPhotos: affected });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).send(msg || 'Server error');
  }
});

// PATCH /api/tags/:tagId
// body: { name?, desc?, replaceId? }
app.patch('/api/tags/:tagId', (req, res) => {
  try {
    const tagId = String(req.params.tagId).trim();
    const tags = readJson<Tag[]>(TAG_JSON, [] as Tag[]);
    const i = tags.findIndex((t) => t.tagId === tagId);
    if (i === -1) return res.status(404).send('tag-not-found');

    const body = req.body ?? {};
    const replaceId = body.replaceId ? String(body.replaceId).trim() : '';

    if (typeof body.name === 'string') tags[i].name = body.name;
    if (typeof body.desc === 'string' || body.desc === null) tags[i].desc = body.desc ?? undefined;

    if (replaceId && replaceId !== tagId) {
      if (tags.some((t) => t.tagId === replaceId)) {
        return res.status(409).json({ ok: false, reason: 'tagId-already-exists' });
      }
      tags[i].tagId = replaceId;

      const gallery = readJson<GalleryItem[]>(GALLERY_JSON, [] as GalleryItem[]);
      let affected = 0;
      for (const g of gallery) {
        if (g.tagId === tagId) {
          g.tagId = replaceId;
          affected++;
        }
      }
      writeJson(GALLERY_JSON, gallery);
      writeJson(TAG_JSON, tags);
      return res.json({ ok: true, tag: tags[i], migratedPhotos: affected });
    }

    writeJson(TAG_JSON, tags);
    res.json({ ok: true, tag: tags[i] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).send(msg || 'Server error');
  }
});

// DELETE /api/tags/:tagId
// Effet: supprime le tag + met TagId="" dans les photos liées
app.delete('/api/tags/:tagId', (req, res) => {
  try {
    const tagId = String(req.params.tagId).trim();

    const tags = readJson<Tag[]>(TAG_JSON, [] as Tag[]);
    const exists = tags.some((t) => t.tagId === tagId);
    if (!exists) return res.status(404).send('tag-not-found');

    const kept = tags.filter((t) => t.tagId !== tagId);
    writeJson(TAG_JSON, kept);

    const gallery = readJson<GalleryItem[]>(GALLERY_JSON, [] as GalleryItem[]);
    let affected = 0;
    for (const g of gallery) {
      if (g.tagId === tagId) {
        g.tagId = ''; // délier
        affected++;
      }
    }
    writeJson(GALLERY_JSON, gallery);

    res.json({ ok: true, removedTagId: tagId, unlinkedPhotos: affected });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).send(msg || 'Server error');
  }
});

// DELETE /api/photos/:id
app.delete('/api/photos/:id', (req, res) => {
  try {
    const id = String(req.params.id);
    const gallery = readJson<GalleryItem[]>(GALLERY_JSON, [] as GalleryItem[]);
    const idx = gallery.findIndex((g) => g.id === id);
    if (idx === -1) return res.status(404).send('photo-not-found');

    const item = gallery[idx];

    try {
      fs.unlinkSync(absFromGalleryRel(item.path));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).send(msg);
    }

    if (item.thumbnailPath) {
      try {
        fs.unlinkSync(absFromGalleryRel(item.thumbnailPath));
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        res.status(500).send(msg);
      }
    }

    gallery.splice(idx, 1);
    writeJson(GALLERY_JSON, gallery);

    res.json({ ok: true, removedId: id });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).send(msg || 'Server error');
  }
});

// POST /api/albums
// body: { name: string; desc?: string; albumId?: string }
app.post("/api/albums", (req, res) => {
  try {
    const nameRaw = req.body?.name;
    const descRaw = req.body?.desc;
    let albumId: string = String(req.body?.albumId ?? "").trim();

    const name = typeof nameRaw === "string" ? nameRaw.trim() : "";
    const desc = typeof descRaw === "string" ? descRaw : undefined;

    if (!name) {
      return res.status(400).json({ ok: false, reason: "name-required" });
    }

    const albums = readJson<Album[]>(ALBUM_JSON, [] as Album[]);

    if (albumId && albums.some(a => a.albumId === albumId)) {
      return res.status(409).json({ ok: false, reason: "albumId-exists" });
    }

    const sameName = (a: Album) =>
      a.name.localeCompare(name, undefined, { sensitivity: "accent" }) === 0;
    if (albums.some(sameName)) {
      return res.status(409).json({ ok: false, reason: "album-name-exists" });
    }

    if (!albumId) albumId = uuidv4();

    const album: Album = { name, desc, albumId };
    albums.push(album);
    writeJson(ALBUM_JSON, albums);

    return res.status(201).json({ ok: true, album });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return res.status(500).send(msg || "Server error");
  }
});

// POST /api/tags
// body: { name: string; desc?: string; tagId?: string }
app.post("/api/tags", (req, res) => {
  try {
    const nameRaw = req.body?.name;
    const descRaw = req.body?.desc;
    let tagId: string = String(req.body?.tagId ?? "").trim();

    const name = typeof nameRaw === "string" ? nameRaw.trim() : "";
    const desc = typeof descRaw === "string" ? descRaw : undefined;

    if (!name) {
      return res.status(400).json({ ok: false, reason: "name-required" });
    }

    const tags = readJson<Tag[]>(TAG_JSON, [] as Tag[]);

    if (tagId && tags.some(t => t.tagId === tagId)) {
      return res.status(409).json({ ok: false, reason: "tagId-exists" });
    }

    const sameName = (t: Tag) =>
      t.name.localeCompare(name, undefined, { sensitivity: "accent" }) === 0;
    if (tags.some(sameName)) {
      return res.status(409).json({ ok: false, reason: "tag-name-exists" });
    }

    if (!tagId) tagId = uuidv4();

    const tag: Tag = { name, desc, tagId };
    tags.push(tag);
    writeJson(TAG_JSON, tags);

    return res.status(201).json({ ok: true, tag });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return res.status(500).send(msg || "Server error");
  }
});

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
  const tags = readJson<Tag[]>(TAG_JSON, []);
  const norm = tags.map((t) => ({
    name: t.name,
    desc: t.desc,
    tagId: t.tagId,
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
    const tags = readJson<Tag[]>(TAG_JSON, []);
    const albumExists = albums.some((a) => a.albumId === albumId);
    const tagExists = tags.some((t) => t.tagId === tagId);

    if (!albumExists) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ ok: false, reason: 'unknown-album-id' });
    }
    if (!tagExists) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ ok: false, reason: 'unknown-tag-id' });
    }

    const entry = {
      filename,
      path: `./gallery/${filename}`,
      thumbnailPath: '',
      year,
      month,
      day,
      albumId,
      tagId: tagId,
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
