import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { createClubApiApp } from "./clubApiApp.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || process.env.EVENTS_PORT || 3001);
const DIST_DIR = path.join(__dirname, "..", "dist");

const app = createClubApiApp();

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(DIST_DIR, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Сайт и API: http://localhost:${PORT}`);
  console.log(`Мероприятия: http://localhost:${PORT}/api/events`);
});
