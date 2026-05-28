import express from "express";
import {
  allocateEventId,
  loadEvents,
  saveEvents,
} from "./eventsStore.js";

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

const toIsoDate = (value) => {
  if (value == null || value === "") return new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? new Date().toISOString()
    : date.toISOString();
};

const normalizeEvent = (event) => ({
  ...event,
  participants: Array.isArray(event?.participants) ? event.participants : [],
});

const sortEvents = (list) =>
  [...list].sort((a, b) => {
    const ta = new Date(a.plannedAt).getTime();
    const tb = new Date(b.plannedAt).getTime();
    return (Number.isNaN(ta) ? 0 : ta) - (Number.isNaN(tb) ? 0 : tb);
  });

const findEvent = (events, id) =>
  events.find((event) => String(event.id) === String(id));

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

export const createEventsRouter = () => {
  const router = express.Router();

  const requireAdmin = (req, res, next) => {
    const key = req.headers["x-events-admin-key"];
    if (!key || key !== ADMIN_KEY) {
      return res.status(403).json({
        message: "Доступ только для администратора",
      });
    }
    return next();
  };

  const requireAuth = (req, res, next) => {
    const userId = parseJwtSub(req.headers.authorization || "");
    if (!userId) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    req.authUserId = userId;
    return next();
  };

  router.get(
    "/",
    asyncHandler(async (_req, res) => {
      const events = sortEvents(await loadEvents()).map(normalizeEvent);
      res.json(events);
    })
  );

  router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const events = await loadEvents();
      const event = findEvent(events, req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Мероприятие не найдено" });
      }
      return res.json(normalizeEvent(event));
    })
  );

  router.post(
    "/",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const body = req.body || {};
      const events = await loadEvents();
      const created = normalizeEvent({
        id: await allocateEventId(),
        title: body.title || "Новое мероприятие",
        description: body.description || "",
        plannedAt: toIsoDate(body.plannedAt),
        participants: [],
      });
      events.push(created);
      await saveEvents(events);
      return res.status(201).json(created);
    })
  );

  router.put(
    "/:id/change",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const events = await loadEvents();
      const event = findEvent(events, req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Мероприятие не найдено" });
      }

      const body = req.body || {};
      if (body.title != null) event.title = body.title;
      if (body.description != null) event.description = body.description;
      if (body.plannedAt != null) event.plannedAt = toIsoDate(body.plannedAt);

      await saveEvents(events);
      return res.json(normalizeEvent(event));
    })
  );

  router.delete(
    "/:id/del",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const events = await loadEvents();
      const next = events.filter((e) => String(e.id) !== String(req.params.id));
      if (next.length === events.length) {
        return res.status(404).json({ message: "Мероприятие не найдено" });
      }
      await saveEvents(next);
      return res.status(204).send();
    })
  );

  const registerToggle = (action) =>
    asyncHandler(async (req, res) => {
      const events = await loadEvents();
      const event = findEvent(events, req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Мероприятие не найдено" });
      }

      const uid = req.authUserId;
      event.participants = Array.isArray(event.participants)
        ? event.participants
        : [];

      if (action === "join") {
        if (!event.participants.some((p) => String(p.id ?? p) === String(uid))) {
          event.participants.push({ id: uid });
        }
      } else {
        event.participants = event.participants.filter(
          (p) => String(p.id ?? p) !== String(uid)
        );
      }

      await saveEvents(events);
      return res.status(204).send();
    });

  router.post("/:id/join", requireAuth, registerToggle("join"));
  router.patch("/:id/join", requireAuth, registerToggle("join"));
  router.post("/:id/quit", requireAuth, registerToggle("quit"));
  router.patch("/:id/quit", requireAuth, registerToggle("quit"));

  return router;
};

