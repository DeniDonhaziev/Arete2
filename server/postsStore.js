import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const POSTS_FILE = path.join(DATA_DIR, "posts.json");
const META_KEY = path.join(DATA_DIR, "posts-meta.json");

const ensureDataDir = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
};

const readMeta = async () => {
  try {
    const raw = await fs.readFile(META_KEY, "utf8");
    return JSON.parse(raw);
  } catch {
    return { nextPostId: 100 };
  }
};

const writeMeta = async (meta) => {
  await ensureDataDir();
  await fs.writeFile(META_KEY, JSON.stringify(meta), "utf8");
};

export const loadPosts = async () => {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(POSTS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const savePosts = async (posts) => {
  await ensureDataDir();
  await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2), "utf8");
};

export const allocatePostId = async () => {
  const meta = await readMeta();
  const id = meta.nextPostId;
  meta.nextPostId += 1;
  await writeMeta(meta);
  return id;
};
