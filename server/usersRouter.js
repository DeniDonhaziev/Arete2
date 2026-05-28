import express from "express";
import {
  allocateUserId,
  loadUserRecords,
  saveUserRecords,
  toPublicUser,
} from "./usersStore.js";

const ADMIN_KEY = process.env.EVENTS_ADMIN_KEY || "arete-events-admin-dev";

const ROLE_NAMES = {
  1: "BRONZE",
  2: "SILVER",
  3: "GOLD",
  4: "RED",
};

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const isAdminRequest = (req) =>
  req.headers["x-admin-panel"] === "1" ||
  req.headers["x-events-admin-key"] === ADMIN_KEY;

const requireAdmin = (req, res, next) => {
  if (!isAdminRequest(req)) {
    return res.status(403).json({ message: "Доступ только для администратора" });
  }
  return next();
};

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const findRecord = (records, id) =>
  records.find((u) => String(u.id) === String(id));

export const createUsersRouter = () => {
  const router = express.Router();

  router.get(
    "/",
    asyncHandler(async (_req, res) => {
      const records = await loadUserRecords();
      res.json(records.map(toPublicUser));
    })
  );

  router.post(
    "/sync",
    asyncHandler(async (req, res) => {
      const body = req.body || {};
      const email = normalizeEmail(body.email);
      if (!email) {
        return res.status(400).json({ message: "Укажите email" });
      }

      const records = await loadUserRecords();
      const index = records.findIndex((u) => normalizeEmail(u.email) === email);

      const record = {
        id: body.id ?? (index >= 0 ? records[index].id : await allocateUserId()),
        firstName: String(body.firstName || "").trim(),
        lastName: String(body.lastName || "").trim(),
        email,
        passwordHash: body.passwordHash || records[index]?.passwordHash || "",
        roles: Array.isArray(body.roles) ? body.roles : [{ id: 1, name: "GREEN" }],
        createdAt: body.createdAt || records[index]?.createdAt || new Date().toISOString(),
      };

      if (index >= 0) {
        records[index] = { ...records[index], ...record };
      } else {
        records.push(record);
      }

      await saveUserRecords(records);
      return res.json(toPublicUser(record));
    })
  );

  router.put(
    "/:id/change",
    asyncHandler(async (req, res) => {
      const records = await loadUserRecords();
      const index = records.findIndex(
        (u) => String(u.id) === String(req.params.id)
      );
      if (index === -1) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      const body = req.body || {};
      if (body.firstName != null) records[index].firstName = body.firstName;
      if (body.lastName != null) records[index].lastName = body.lastName;
      if (body.email != null) records[index].email = normalizeEmail(body.email);

      await saveUserRecords(records);
      return res.json(toPublicUser(records[index]));
    })
  );

  return router;
};

export const createAdminUsersRouter = () => {
  const router = express.Router();

  router.post(
    "/:id/add-role",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const roleId = Number(req.query.roleId);
      const records = await loadUserRecords();
      const record = findRecord(records, req.params.id);
      if (!record) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      if (roleId && !record.roles.some((r) => r.id === roleId)) {
        record.roles = [
          ...record.roles,
          { id: roleId, name: ROLE_NAMES[roleId] || "BRONZE" },
        ];
        await saveUserRecords(records);
      }

      return res.json(toPublicUser(record));
    })
  );

  router.post(
    "/:id/remove-role",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const roleId = Number(req.query.roleId);
      const records = await loadUserRecords();
      const record = findRecord(records, req.params.id);
      if (!record) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      record.roles = record.roles.filter((r) => r.id !== roleId);
      await saveUserRecords(records);
      return res.json(toPublicUser(record));
    })
  );

  router.delete(
    "/:id/del",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const records = await loadUserRecords();
      const next = records.filter((u) => String(u.id) !== String(req.params.id));
      if (next.length === records.length) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }
      await saveUserRecords(next);
      return res.status(204).send();
    })
  );

  return router;
};
