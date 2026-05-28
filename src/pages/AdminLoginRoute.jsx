import { useLayoutEffect } from "react";
import { Navigate } from "react-router-dom";
import {
  completeAuth,
  hasValidSession,
  useAuthStore,
} from "../store/authStore";
import { readPersistedSession } from "../utils/authStorage";
import { isAdmin } from "../utils/roles";
import AdminLoginPage from "./AdminLoginPage";

const AdminLoginRoute = () => {
  const user = useAuthStore((state) => state.user);

  useLayoutEffect(() => {
    const stored = readPersistedSession();
    if (stored && !hasValidSession(useAuthStore.getState())) {
      completeAuth(stored.token, stored.user);
    }
  }, []);

  const persisted = readPersistedSession();
  const effectiveUser = user ?? persisted?.user;

  if (isAdmin(effectiveUser)) {
    return <Navigate to="/admin" replace />;
  }

  return <AdminLoginPage />;
};

export default AdminLoginRoute;
