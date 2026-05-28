import { useLayoutEffect } from "react";
import { Navigate } from "react-router-dom";
import Home from "./Home";
import { completeAuth, useAuthStore, hasValidSession } from "../store/authStore";
import { readPersistedSession } from "../utils/authStorage";

const MainRoute = () => {
  const session = useAuthStore(hasValidSession);

  useLayoutEffect(() => {
    const stored = readPersistedSession();
    if (stored && !hasValidSession(useAuthStore.getState())) {
      completeAuth(stored.token, stored.user);
    }
  }, []);

  if (!session && !readPersistedSession()) {
    return <Navigate to="/" replace />;
  }

  return <Home />;
};

export default MainRoute;
