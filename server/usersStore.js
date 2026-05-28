import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const META_FILE = path.join(DATA_DIR, "users-meta.json");

const ensureDataDir = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
};

const readMeta = async () => {
  try {
    const raw = await fs.readFile(META_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return { nextUserId: 10 };
  }
};

const writeMeta = async (meta) => {
  await ensureDataDir();
  await fs.writeFile(META_FILE, JSON.stringify(meta), "utf8");
};

export const loadUserRecords = async () => {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(USERS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveUserRecords = async (records) => {
  await ensureDataDir();
  await fs.writeFile(USERS_FILE, JSON.stringify(records, null, 2), "utf8");
};

export const allocateUserId = async () => {
  const meta = await readMeta();
  const id = meta.nextUserId;
  meta.nextUserId += 1;
  await writeMeta(meta);
  return id;
};

export const toPublicUser = (record) => {
  if (!record) return null;
  const { passwordHash, ...user } = record;
  return user;
};
