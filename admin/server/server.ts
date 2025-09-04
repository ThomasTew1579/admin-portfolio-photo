import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

// Dossiers
const UPLOAD_DIR = path.resolve(process.cwd(), "uploads", "photos");
const DATA_FILE = path.resolve(process.cwd(), "data", "cardList.json");

// s'assurer que les dossiers existent
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });

// servir les uploads statiquement (accès via /uploads/…)
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

// Multer storage: garde l’extension, nettoie le nom
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const base = (String(_req.body?.filename || path.basename(file.originalname, ext)))
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const finalName = `${base}-${Date.now()}${ext}`;
    cb(null, finalName);
  },
});

const upload = multer({ storage });

// Type de l’entrée JSON
type Card = {
  filename: string; // ex: "my-photo-123456.jpg"
  path: string;     // ex: "/uploads/photos/my-photo-123456.jpg"
  date: string;     // "YYYY-MM-DD"
};

// lecture/écriture du JSON
function readList(): Card[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}
function writeList(list: Card[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), "utf-8");
}

// Route d’upload
app.post("/api/photos", upload.single("photo"), (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded.");

    const date = String(req.body.date || "").slice(0, 10);
    const filename = req.file.filename; // nom final sur disque
    const publicPath = `/uploads/photos/${filename}`;

    const entry: Card = {
      filename,
      path: publicPath,
      date: date || new Date().toISOString().slice(0, 10),
    };

    const list = readList();
    list.push(entry);
    writeList(list);

    res.json({ ok: true, entry });
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e?.message || "Server error");
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});