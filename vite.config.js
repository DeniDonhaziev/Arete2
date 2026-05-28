import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { eventsApiPlugin } from "./vite.eventsPlugin.js";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const adminKey =
    env.VITE_EVENTS_ADMIN_KEY || env.EVENTS_ADMIN_KEY || "arete-events-admin-dev";

  return {
    plugins: [react(), eventsApiPlugin()],
    define: {
      "import.meta.env.VITE_EVENTS_ADMIN_KEY": JSON.stringify(adminKey),
    },
  };
});
