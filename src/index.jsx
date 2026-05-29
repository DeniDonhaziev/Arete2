import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { USE_FIREBASE_AUTH } from "./config/firebaseEnv";
import { restoreSessionFromStorage } from "./store/authStore";
import { ensureAdminAccount } from "./services/ensureAdminAccount";
import { startFirebaseAuthListener } from "./services/firebaseAuthService";

if (USE_FIREBASE_AUTH) {
  startFirebaseAuthListener();
} else {
  restoreSessionFromStorage();
  void ensureAdminAccount();
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
