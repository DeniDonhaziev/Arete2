import { createMockToken } from "./mockData";
import {
  getAuthUserId,
  isAdminAuth,
  resolveAuthUser,
} from "./mockSessionAuth";
import {
  createLocalUser,
  findLocalUserByEmail,
  findLocalUserById,
  toPublicUser,
} from "../services/localUsersStorage";
import { hashPassword, verifyPassword } from "../utils/password";

const clone = (value) => JSON.parse(JSON.stringify(value));

const syncStoresFromStorage = () => {};

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

const parseBody = (body) => {
  if (!body) return {};
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
};

const matchPath = (endpoint) => {
  const path = endpoint.replace(/^\/+/, "");
  const parts = path.split("/").filter(Boolean);
  return { parts, path };
};

const authError = (message, status = 401) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const requireAdmin = (headers) => {
  if (!getAuthUserId(headers)) throw authError("Требуется авторизация", 401);
  if (!isAdminAuth(headers)) {
    throw authError("Доступ только для администратора", 403);
  }
};

export const resetMockStore = () => {};

export const mockApiCall = async (endpoint, options = {}) => {
  await delay();
  syncStoresFromStorage();

  const method = (options.method || "GET").toUpperCase();
  const body = parseBody(options.body);
  const { parts } = matchPath(endpoint);
  const headers = options.headers || {};
  const authUserId = getAuthUserId(headers);
  const adminRequest =
    isAdminAuth(headers) || headers["X-Admin-Panel"] === "1";

  if (parts[0] === "auth" && parts[1] === "login" && method === "POST") {
    const email = body.email || body.username || body.login;
    const record = findLocalUserByEmail(email);

    if (!record) {
      throw authError("Неверный email или пароль");
    }

    if (!record.passwordHash) {
      throw authError(
        "Для этого аккаунта нужна регистрация с паролем. Создайте новый аккаунт."
      );
    }

    const valid = await verifyPassword(body.password, record.passwordHash);
    if (!valid) {
      throw authError("Неверный email или пароль");
    }

    return {
      token: createMockToken(record.id),
      user: toPublicUser(record),
    };
  }

  if (parts[0] === "auth" && parts[1] === "registration" && method === "POST") {
    if (!body.firstName?.trim() || !body.lastName?.trim()) {
      throw authError("Укажите имя и фамилию", 400);
    }

    if (!body.email?.trim()) {
      throw authError("Укажите email", 400);
    }

    if (!body.password || body.password.length < 8) {
      throw authError("Пароль должен содержать минимум 8 символов", 400);
    }

    const passwordHash = await hashPassword(body.password);
    const user = createLocalUser({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      passwordHash,
    });

    return {
      token: createMockToken(user.id),
      user,
    };
  }

  return null;
};

export {
  getAuthUserIdFromHeaders,
  getAuthUserId,
  resolveAuthUser,
  isAdminAuth,
} from "./mockSessionAuth";
