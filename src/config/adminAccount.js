/** Учётная запись администратора (локальный режим до Firebase) */
export const ADMIN_EMAIL =
  import.meta.env.VITE_ADMIN_EMAIL || "admin@arete.local";

export const ADMIN_PASSWORD =
  import.meta.env.VITE_ADMIN_PASSWORD || "admin12345678";

export const ADMIN_PROFILE = {
  firstName: "Админ",
  lastName: "Arete",
};

export const isAdminEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase() === ADMIN_EMAIL.trim().toLowerCase();
