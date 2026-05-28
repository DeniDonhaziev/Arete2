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
} else {
  console.warn("Папка dist/ не найдена — выполните npm run build");
  app.get("/", (_req, res) => {
    res.status(503).send("Сайт собирается. Запустите npm run build.");
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Books Club запущен на порту ${PORT}`);
});
