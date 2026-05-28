import { Navigate } from "react-router-dom";
import { useAuthStore, hasValidSession } from "../store/authStore";
import { hasPersistedSession } from "../utils/authStorage";
import RegisterPage from "./RegisterPage";

const GuestRoute = () => {
  const session = useAuthStore(hasValidSession);

  if (session || hasPersistedSession()) {
    return <Navigate to="/main" replace />;
  }

  return <RegisterPage isLanding />;
};

export default GuestRoute;
