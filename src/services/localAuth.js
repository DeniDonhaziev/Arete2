import { createMockToken } from "../API/mockData";
import { createLocalUser, findLocalUserByEmail } from "./localUsersStorage";
import { hashPassword, verifyPassword } from "../utils/password";
import { isAdmin } from "../utils/roles";

/** Регистрация полностью в браузере — работает без сервера */
export const registerLocal = async ({
  firstName,
  lastName,
  email,
  password,
}) => {
  const passwordHash = await hashPassword(password);
  const user = createLocalUser({
    firstName,
    lastName,
    email,
    passwordHash,
  });

  return {
    token: createMockToken(user.id),
    user,
  };
};

/** Вход полностью в браузере */
export const loginLocal = async ({ email, password }) => {
  const record = findLocalUserByEmail(email);

  if (!record?.passwordHash) {
    const error = new Error(
      "Аккаунт не найден в этом браузере. Зарегистрируйтесь заново или включите Firebase на Render (VITE_FIREBASE_* и пересборка)."
    );
    error.status = 401;
    throw error;
  }

  const valid = await verifyPassword(password, record.passwordHash);
  if (!valid) {
    const error = new Error("Неверный пароль");
    error.status = 401;
    throw error;
  }

  const fresh = findLocalUserByEmail(email);
  const publicUser = fresh
    ? (() => {
        const { passwordHash: _, ...rest } = fresh;
        return rest;
      })()
    : (() => {
        const { passwordHash, ...rest } = record;
        return rest;
      })();

  return {
    token: createMockToken(publicUser.id),
    user: publicUser,
  };
};

/** Вход только для учётки с ролью администратора */
export const loginAdminLocal = async ({ email, password }) => {
  const { user } = await loginLocal({ email, password });

  if (!isAdmin(user)) {
    const error = new Error("Эта учётная запись не является администратором");
    error.status = 403;
    throw error;
  }

  const fresh = findLocalUserByEmail(email);
  if (fresh) {
    const { passwordHash: _, ...publicUser } = fresh;
    return {
      token: createMockToken(publicUser.id),
      user: publicUser,
    };
  }

  return { token: createMockToken(user.id), user };
};
