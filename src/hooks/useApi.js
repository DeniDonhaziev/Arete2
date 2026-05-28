import { useCallback } from "react";
import {
  EVENTS_ADMIN_KEY,
  isEventsEndpoint,
  isPostsEndpoint,
  isUsersEndpoint,
} from "../config/eventsApi";
import { useAuthStore } from "../store/authStore";
import apiCall from "../API/apiClient";
import { readPersistedSession } from "../utils/authStorage";
import { isTokenExpired } from "../utils/jwt";
import { isAdmin } from "../utils/roles";

const resolveAuthToken = () => {
  const fromStore = useAuthStore.getState().token;
  if (fromStore) return fromStore;
  return readPersistedSession()?.token ?? null;
};

const attachAuthorToPostBody = (body, user) => {
  if (!body || !user?.id) return body;
  try {
    const parsed = typeof body === "string" ? JSON.parse(body) : { ...body };
    if (!parsed.author) {
      parsed.author = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    }
    return JSON.stringify(parsed);
  } catch {
    return body;
  }
};

export const useApi = () => {
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  const call = useCallback(
    async (endpoint, options = {}) => {
      const headers = {
        ...(options.headers || {}),
      };

      let body = options.body;
      const method = (options.method || "GET").toUpperCase();
      const user = useAuthStore.getState().user;

      if (body && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }

      const authToken = token || resolveAuthToken();

      if (authToken) {
        const isMockToken = String(authToken).includes("mock-signature");
        if (!isMockToken && isTokenExpired(authToken)) {
          logout();
          throw new Error("Сессия истекла. Войдите снова.");
        }

        headers.Authorization = `Bearer ${authToken}`;
      }

      if (isPostsEndpoint(endpoint) && method === "POST" && body) {
        body = attachAuthorToPostBody(body, user);
      }

      if (isAdmin(user)) {
        if (isPostsEndpoint(endpoint) || isUsersEndpoint(endpoint)) {
          headers["X-Admin-Panel"] = "1";
        }
        if (
          (isEventsEndpoint(endpoint) ||
            isPostsEndpoint(endpoint) ||
            isUsersEndpoint(endpoint)) &&
          EVENTS_ADMIN_KEY &&
          ["POST", "PUT", "DELETE", "PATCH"].includes(method)
        ) {
          headers["X-Events-Admin-Key"] = EVENTS_ADMIN_KEY;
        }
      }

      try {
        return await apiCall(endpoint, {
          ...options,
          body,
          headers,
        });
      } catch (error) {
        if (error.status === 401 || error.message.includes("Сессия истекла")) {
          logout();
        }
        throw error;
      }
    },
    [token, logout]
  );

  return { apiCall: call };
};
