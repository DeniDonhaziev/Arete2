import apiCall from "../API/apiClient";
import { USE_FIREBASE_AUTH } from "../config/firebaseEnv";
import { USE_MOCK_API } from "../API/mockConfig";
import { normalizeAuthResponse } from "../utils/auth";
import {
  firebaseLogin,
  firebaseLoginAdmin,
  firebaseRegister,
} from "./firebaseAuthService";
import { loginAdminLocal, loginLocal, registerLocal } from "./localAuth";
import { ensureAdminAccount } from "./ensureAdminAccount";
import { findLocalUserByEmail } from "./localUsersStorage";
import { syncUserRecordToServer } from "./syncUserToServer";

export const registerUser = async (data) => {
  if (USE_FIREBASE_AUTH) {
    return firebaseRegister(data);
  }

  if (USE_MOCK_API) {
    try {
      const result = await registerLocal(data);
      const record = findLocalUserByEmail(data.email);
      if (record) {
        await syncUserRecordToServer(record);
      }
      return result;
    } catch (err) {
      if (err.status === 409) {
        return loginLocal({ email: data.email, password: data.password });
      }
      throw err;
    }
  }

  const response = await apiCall("/auth/registration", {
    method: "POST",
    body: JSON.stringify(data),
  });

  const { token, user } = normalizeAuthResponse(response);
  if (!token || user?.id == null) {
    throw new Error("Некорректный ответ сервера при регистрации");
  }

  return { token, user };
};

export const loginUser = async (data) => {
  if (USE_FIREBASE_AUTH) {
    return firebaseLogin(data);
  }

  if (USE_MOCK_API) {
    return loginLocal(data);
  }

  const response = await apiCall("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

  const { token, user } = normalizeAuthResponse(response);
  if (!token || user?.id == null) {
    throw new Error("Некорректный ответ сервера при входе");
  }

  return { token, user };
};

export const loginAdmin = async ({ email, password }) => {
  if (USE_FIREBASE_AUTH) {
    return firebaseLoginAdmin({ email, password });
  }

  await ensureAdminAccount();

  if (USE_MOCK_API) {
    return loginAdminLocal({ email, password });
  }

  const response = await apiCall("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  const { token, user } = normalizeAuthResponse(response);
  if (!token || user?.id == null) {
    throw new Error("Некорректный ответ сервера при входе");
  }

  return { token, user };
};
