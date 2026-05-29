import { useEffect, useLayoutEffect } from "react";
import Newspaper from "./pages/Newspaper";
import "./scss/app.scss";
import { Navigate, Route, Routes } from "react-router-dom";
import Settings from "./pages/Settings";
import GuestRoute from "./pages/GuestRoute";
import MainRoute from "./pages/MainRoute";
import LoginRoute from "./pages/LoginRoute";
import RegistrationRoute from "./pages/RegistrationRoute";
import SingUp from "./pages/SingUp";
import Happenings from "./pages/Happenings";
import EventDetails from "./pages/EventDetails";
import Rating from "./pages/Rating";
import AdminRoute from "./pages/AdminRoute";
import AdminLoginRoute from "./pages/AdminLoginRoute";
import { USE_FIREBASE_AUTH } from "./config/firebaseEnv";
import { ensureAdminAccount } from "./services/ensureAdminAccount";
import { startFirebaseAuthListener } from "./services/firebaseAuthService";
import { logoutSession } from "./services/authSession";
import { useTheme } from "./store/useTheme";
import NotFoundPage from "./pages/NotFoundPage";
import BottomNav from "./components/BottomNav";
import {
  restoreSessionFromStorage,
  sanitizeAuthStorage,
  useAuthStore,
} from "./store/authStore";
import { getTokenExpiryMs, isTokenExpired } from "./utils/jwt";

function App() {
  const { theme } = useTheme();
  const token = useAuthStore((state) => state.token);

  useLayoutEffect(() => {
    if (USE_FIREBASE_AUTH) {
      startFirebaseAuthListener();
    } else {
      restoreSessionFromStorage();
      void ensureAdminAccount();
    }
    sanitizeAuthStorage();
  }, []);

  useEffect(() => {
    if (!token || USE_FIREBASE_AUTH) return;

    // Mock-токены не проверяем — иначе сессия сбрасывается
    if (token.includes("mock-signature")) return;

    if (isTokenExpired(token)) {
      void logoutSession();
      return;
    }

    const expiryMs = getTokenExpiryMs(token);
    if (!expiryMs) return;

    const timeout = expiryMs - Date.now();
    if (timeout <= 0) {
      void logoutSession();
      return;
    }

    const timerId = setTimeout(() => {
      void logoutSession();
    }, timeout);

    return () => clearTimeout(timerId);
  }, [token]);

  return (
    <div className={theme === "black" ? "app" : "appColor"}>
      <Routes>
        <Route path="/" element={<GuestRoute />} />
        <Route path="/main" element={<MainRoute />} />
        <Route path="/home" element={<Navigate to="/main" replace />} />
        <Route path="/newspaper" element={<Newspaper />} />
        <Route path="/happenings" element={<Happenings />} />
        <Route path="/happenings/:id" element={<EventDetails />} />
        <Route path="/rating" element={<Rating />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/registration" element={<RegistrationRoute />} />
        <Route path="/singup" element={<SingUp />} />
        <Route path="/admin/login" element={<AdminLoginRoute />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default App;
