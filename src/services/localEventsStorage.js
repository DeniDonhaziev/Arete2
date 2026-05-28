import {
  EVENTS_STORAGE_KEY,
  notifyEventsUpdated,
} from "../utils/eventsSync";

const META_KEY = "arete-local-events-meta";

const readMeta = () => {
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : { nextEventId: 1 };
  } catch {
    return { nextEventId: 1 };
  }
};

const writeMeta = (meta) => {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
};

export const loadStoredEvents = () => {
  try {
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveStoredEvents = (events) => {
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  notifyEventsUpdated();
};

export const allocateEventId = () => {
  const meta = readMeta();
  const id = meta.nextEventId;
  meta.nextEventId += 1;
  writeMeta(meta);
  return id;
};

export const resetStoredEvents = () => {
  localStorage.removeItem(EVENTS_STORAGE_KEY);
  localStorage.removeItem(META_KEY);
  notifyEventsUpdated();
};
