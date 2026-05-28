import { initialMockPosts } from "../API/mockData";

const STORAGE_KEY = "arete-local-posts";
const META_KEY = "arete-local-posts-meta";

/** Старые демо-стихи, которые убираем из газеты */
const DEMO_POST_IDS = new Set([1, 2]);

const readMeta = () => {
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : { nextPostId: 100 };
  } catch {
    return { nextPostId: 100 };
  }
};

const writeMeta = (meta) => {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
};

export const loadStoredPosts = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const saveStoredPosts = (posts) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
};

const withDefaultStatus = (posts) =>
  posts.map((post) => ({
    ...post,
    status: post.status || "approved",
  }));

const stripDemoPosts = (posts) =>
  posts.filter((post) => !DEMO_POST_IDS.has(Number(post.id)));

export const seedPostsIfEmpty = () => {
  const stored = loadStoredPosts();
  if (stored) {
    const cleaned = stripDemoPosts(stored);
    if (cleaned.length !== stored.length) {
      saveStoredPosts(cleaned);
    }
    return withDefaultStatus(cleaned);
  }

  const seeded = withDefaultStatus([...initialMockPosts]);
  saveStoredPosts(seeded);
  return seeded;
};

export const allocatePostId = () => {
  const meta = readMeta();
  const id = meta.nextPostId;
  meta.nextPostId += 1;
  writeMeta(meta);
  return id;
};
