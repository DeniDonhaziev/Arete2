import express from "express";
import { createEventsRouter } from "./eventsRouter.js";
import { createPostsRouter } from "./postsRouter.js";
import {
  createAdminUsersRouter,
  createUsersRouter,
} from "./usersRouter.js";

export const createClubApiApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/events", createEventsRouter());
  app.use("/api/posts", createPostsRouter());
  app.use("/api/users", createUsersRouter());
  app.use("/api/admin/users", createAdminUsersRouter());
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "arete-club-api" });
  });
  app.use((err, _req, res, next) => {
    if (err instanceof SyntaxError && "body" in err) {
      return res.status(400).json({ message: "Некорректные данные запроса" });
    }
    console.error(err);
    return res.status(500).json({
      message: err.message || "Ошибка сервера",
    });
  });
  return app;
};

/** @deprecated используйте createClubApiApp */
export const createEventsApp = createClubApiApp;
