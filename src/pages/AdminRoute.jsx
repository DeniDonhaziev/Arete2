import { useLayoutEffect } from "react";
import { Navigate } from "react-router-dom";
import {
  completeAuth,
  hasValidSession,
  useAuthStore,
} from "../store/authStore";
import { readPersistedSession } from "../utils/authStorage";
import { isAdmin } from "../utils/roles";
import AdminPanel from "./AdminPanel";

const AdminRoute = () => {
  const user = useAuthStore((state) => state.user);

  useLayoutEffect(() => {
    const stored = readPersistedSession();
    if (stored && !hasValidSession(useAuthStore.getState())) {
      completeAuth(stored.token, stored.user);
    }
  }, []);

  const persisted = readPersistedSession();
  const effectiveUser = user ?? persisted?.user;

  if (!isAdmin(effectiveUser)) {
    return <Navigate to="/admin/login" replace />;
  }

  return <AdminPanel />;
};

export default AdminRoute;
