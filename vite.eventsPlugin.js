import { createClubApiApp } from "./server/clubApiApp.js";

/** API мероприятий и стихов внутри Vite — общие для всех браузеров */
export const eventsApiPlugin = () => {
  const apiApp = createClubApiApp();

  const attach = (server) => {
    server.middlewares.use((req, res, next) => {
      if (
        req.url?.startsWith("/api/events") ||
        req.url?.startsWith("/api/posts") ||
        req.url?.startsWith("/api/users") ||
        req.url?.startsWith("/api/admin/users") ||
        req.url?.startsWith("/api/health")
      ) {
        return apiApp(req, res, next);
      }
      return next();
    });
  };

  return {
    name: "arete-club-api",
    configureServer: attach,
    configurePreviewServer: attach,
  };
};
