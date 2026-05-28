import express from "express";
import { allocatePostId, loadPosts, savePosts } from "./postsStore.js";

const ADMIN_KEY = process.env.EVENTS_ADMIN_KEY || "arete-events-admin-dev";

const parseJwtSub = (authorization = "") => {
  const bearer = authorization.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";
  if (!bearer) return null;

  const parts = bearer.split(".");
  if (parts.length < 2) return null;

  try {
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const payload = JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
    return payload?.sub ?? null;
  } catch {
    return null;
  }
};

const normalizePost = (post) => ({
  ...post,
  status: post.status || "approved",
});

const isAdminRequest = (req) =>
  req.headers["x-admin-panel"] === "1" ||
  req.headers["x-events-admin-key"] === ADMIN_KEY;

const requireAdmin = (req, res, next) => {
  if (!isAdminRequest(req)) {
    return res.status(403).json({ message: "Доступ только для администратора" });
  }
  return next();
};

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

export const createPostsRouter = () => {
  const router = express.Router();

  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const list = (await loadPosts()).map(normalizePost);
      if (isAdminRequest(req)) {
        return res.json(list);
      }
      return res.json(list.filter((p) => p.status === "approved"));
    })
  );

  router.post(
    "/",
    asyncHandler(async (req, res) => {
      const body = req.body || {};
      const admin = isAdminRequest(req);

      if (!admin) {
        const userId = parseJwtSub(req.headers.authorization || "");
        if (!userId) {
          return res.status(401).json({ message: "Войдите в аккаунт, чтобы отправить стих" });
        }
      }

      const author = body.author || (req.authUserId ? { id: req.authUserId } : null);

      const created = normalizePost({
        id: await allocatePostId(),
        title: body.title || "Без названия",
        description: body.description || "",
        createdAt: new Date().toISOString(),
        status: admin
          ? body.status === "pending"
            ? "pending"
            : "approved"
          : "pending",
        author: author || undefined,
      });

      const posts = await loadPosts();
      posts.unshift(created);
      await savePosts(posts);
      return res.status(201).json(created);
    })
  );

  router.post(
    "/:id/approve",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const posts = await loadPosts();
      const post = posts.find((p) => String(p.id) === String(req.params.id));
      if (!post) {
        return res.status(404).json({ message: "Публикация не найдена" });
      }
      post.status = "approved";
      await savePosts(posts);
      return res.json(normalizePost(post));
    })
  );

  router.patch(
    "/:id/approve",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const posts = await loadPosts();
      const post = posts.find((p) => String(p.id) === String(req.params.id));
      if (!post) {
        return res.status(404).json({ message: "Публикация не найдена" });
      }
      post.status = "approved";
      await savePosts(posts);
      return res.json(normalizePost(post));
    })
  );

  router.post(
    "/:id/reject",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const posts = await loadPosts();
      const post = posts.find((p) => String(p.id) === String(req.params.id));
      if (!post) {
        return res.status(404).json({ message: "Публикация не найдена" });
      }
      post.status = "rejected";
      await savePosts(posts);
      return res.json(normalizePost(post));
    })
  );

  router.patch(
    "/:id/reject",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const posts = await loadPosts();
      const post = posts.find((p) => String(p.id) === String(req.params.id));
      if (!post) {
        return res.status(404).json({ message: "Публикация не найдена" });
      }
      post.status = "rejected";
      await savePosts(posts);
      return res.json(normalizePost(post));
    })
  );

  router.put(
    "/:id/change",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const posts = await loadPosts();
      const post = posts.find((p) => String(p.id) === String(req.params.id));
      if (!post) {
        return res.status(404).json({ message: "Публикация не найдена" });
      }
      const body = req.body || {};
      if (body.title != null) post.title = body.title;
      if (body.description != null) post.description = body.description;
      if (body.status != null) post.status = body.status;
      await savePosts(posts);
      return res.json(normalizePost(post));
    })
  );

  router.delete(
    "/:id/del",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const posts = await loadPosts();
      const next = posts.filter((p) => String(p.id) !== String(req.params.id));
      if (next.length === posts.length) {
        return res.status(404).json({ message: "Публикация не найдена" });
      }
      await savePosts(next);
      return res.status(204).send();
    })
  );

  return router;
};
