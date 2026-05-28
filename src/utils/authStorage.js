import { hasValidSession } from "./session";

const STORAGE_KEY = "auth-storage";

export const writeAuthToStorage = (token, user) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      state: {
        token,
        user,
        isAuthenticated: true,
      },
      version: 0,
    })
  );
};

export const readPersistedSession = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const state = parsed?.state ?? parsed;

    if (!hasValidSession(state)) return null;

    return { token: state.token, user: state.user };
  } catch {
    return null;
  }
};

export const hasPersistedSession = () => readPersistedSession() != null;

export const redirectToMain = () => {
  window.location.assign("/main");
};
