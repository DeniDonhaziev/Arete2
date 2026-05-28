import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { restoreSessionFromStorage } from "./store/authStore";
import { ensureAdminAccount } from "./services/ensureAdminAccount";

restoreSessionFromStorage();
void ensureAdminAccount();

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
