import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { eventsApiPlugin } from "./vite.eventsPlugin.js";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), eventsApiPlugin()],
});
