/** Ключ для создания/редактирования мероприятий на сервере (один для всего клуба) */
export const EVENTS_ADMIN_KEY =
  import.meta.env.VITE_EVENTS_ADMIN_KEY || "arete-events-admin-dev";

/** Базовый URL API мероприятий; в dev — прокси Vite на локальный сервер */
export const EVENTS_API_BASE =
  import.meta.env.VITE_EVENTS_API_BASE_URL || "/api";

export const isEventsEndpoint = (endpoint = "") => {
  const path = String(endpoint).replace(/^\/+/, "");
  return path === "events" || path.startsWith("events/");
};

export const isPostsEndpoint = (endpoint = "") => {
  const path = String(endpoint).replace(/^\/+/, "");
  return path === "posts" || path.startsWith("posts/");
};

export const isUsersEndpoint = (endpoint = "") => {
  const path = String(endpoint).replace(/^\/+/, "");
  return (
    path === "users" ||
    path.startsWith("users/") ||
    path.startsWith("admin/users")
  );
};

/** Мероприятия, стихи и пользователи — с общего сервера */
export const isSharedClubEndpoint = (endpoint = "") =>
  isEventsEndpoint(endpoint) || isPostsEndpoint(endpoint) || isUsersEndpoint(endpoint);
