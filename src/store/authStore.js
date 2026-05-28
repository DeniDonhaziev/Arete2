import { create } from "zustand";
import { persist } from "zustand/middleware";
import { writeAuthToStorage } from "../utils/authStorage";
import { hasValidSession } from "../utils/session";

export { hasValidSession };

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setToken: (newToken, userData) =>
        set({
          token: newToken,
          user: userData,
          isAuthenticated: Boolean(newToken && userData?.id != null),
        }),

      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
        localStorage.removeItem("auth-storage");
      },
    }),
    {
      name: "auth-storage",
      skipHydration: true,
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const completeAuth = (token, user) => {
  if (!token || user?.id == null) {
    throw new Error("Не удалось сохранить сессию");
  }

  writeAuthToStorage(token, user);
  useAuthStore.setState({
    token,
    user,
    isAuthenticated: true,
  });
};

export const restoreSessionFromStorage = () => {
  if (hasValidSession(useAuthStore.getState())) {
    return true;
  }

  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return false;

    const parsed = JSON.parse(raw);
    const state = parsed?.state ?? parsed;

    if (!hasValidSession(state)) return false;

    useAuthStore.setState({
      token: state.token,
      user: state.user,
      isAuthenticated: true,
    });
    return true;
  } catch {
    return false;
  }
};

export const sanitizeAuthStorage = () => {
  const state = useAuthStore.getState();
  if (state.isAuthenticated && !hasValidSession(state)) {
    state.logout();
  }
};
