import { isAdminEmail } from "../config/adminAccount";
import { findLocalUserById } from "../services/localUsersStorage";
import { readPersistedSession } from "../utils/authStorage";
import { parseJwtPayload } from "../utils/jwt";

/**
 * Определяет пользователя по Bearer-токену.
 * Сначала сверяет с auth-storage (надёжно для локального режима),
 * затем пробует разобрать mock-JWT.
 */
export const getSessionFromHeaders = (headers = {}) => {
  const auth = headers.Authorization || headers.authorization || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";

  const persisted = readPersistedSession();
  if (persisted?.token && persisted?.user?.id != null) {
    if (!bearer || bearer === persisted.token) {
      return persisted;
    }
  }

  if (!bearer) return null;

  const payload = parseJwtPayload(bearer);
  const sub = payload?.sub;
  if (!sub || sub === "mock-user") return null;

  const userId = Number(sub);
  const id = Number.isNaN(userId) ? sub : userId;
  const record = findLocalUserById(id);
  if (!record) return null;

  const { passwordHash, ...user } = record;
  return { token: bearer, user };
};

export const getAuthUserIdFromHeaders = (headers = {}) => {
  const session = getSessionFromHeaders(headers);
  return session?.user?.id ?? null;
};

export const getAuthUserId = getAuthUserIdFromHeaders;

export const resolveAuthUser = (headers = {}) =>
  getSessionFromHeaders(headers)?.user ?? null;

export const isAdminAuth = (headers = {}) => {
  const user = resolveAuthUser(headers);
  if (!user) return false;
  if (isAdminEmail(user.email)) return true;
  if (!user.roles?.length) return false;
  return user.roles.some((role) => {
    const name = String(role.name || "").replace(/^ROLE_/, "");
    return name === "RED";
  });
};
