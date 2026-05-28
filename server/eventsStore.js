import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const EVENTS_FILE = path.join(DATA_DIR, "events.json");
const META_FILE = path.join(DATA_DIR, "events-meta.json");

const ensureDataDir = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
};

const readMeta = async () => {
  try {
    const raw = await fs.readFile(META_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return { nextEventId: 1 };
  }
};

const writeMeta = async (meta) => {
  await ensureDataDir();
  await fs.writeFile(META_FILE, JSON.stringify(meta), "utf8");
};

export const loadEvents = async () => {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(EVENTS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveEvents = async (events) => {
  await ensureDataDir();
  await fs.writeFile(EVENTS_FILE, JSON.stringify(events, null, 2), "utf8");
};

export const allocateEventId = async () => {
  const meta = await readMeta();
  const id = meta.nextEventId;
  meta.nextEventId += 1;
  await writeMeta(meta);
  return id;
};
