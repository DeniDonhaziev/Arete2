import { initialMockUsers } from "../API/mockData";
import { isAdminEmail } from "../config/adminAccount";

const STORAGE_KEY = "arete-local-users";
const META_KEY = "arete-local-users-meta";

const readMeta = () => {
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : { nextUserId: 10 };
  } catch {
    return { nextUserId: 10 };
  }
};

const writeMeta = (meta) => {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
};

export const readAllRecords = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeAllRecords = (records) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

export const toPublicUser = (record) => {
  if (!record) return null;
  const { passwordHash, ...user } = record;
  return user;
};

export const loadLocalUsers = () => readAllRecords().map(toPublicUser);

export const findLocalUserByEmail = (email) => {
  const normalized = normalizeEmail(email);
  return (
    readAllRecords().find((u) => normalizeEmail(u.email) === normalized) || null
  );
};

export const findLocalUserById = (id) => {
  ensureLocalUsersSeeded();
  return readAllRecords().find((u) => String(u.id) === String(id)) || null;
};

export const ensureLocalUsersSeeded = () => {
  const records = readAllRecords();
  if (records.length > 0) return records;

  const seeded = initialMockUsers.map((user) => ({
    ...user,
    email: user.email || `user${user.id}@arete.local`,
    createdAt: new Date().toISOString(),
  }));

  writeAllRecords(seeded);
  return seeded;
};

export const createLocalUser = ({ firstName, lastName, email, passwordHash }) => {
  const records = ensureLocalUsersSeeded();
  const normalizedEmail = normalizeEmail(email);

  if (isAdminEmail(normalizedEmail)) {
    const error = new Error(
      "Этот email зарезервирован для администратора. Войдите через /admin/login"
    );
    error.status = 403;
    throw error;
  }

  if (records.some((u) => normalizeEmail(u.email) === normalizedEmail)) {
    const error = new Error("Пользователь с таким email уже зарегистрирован");
    error.status = 409;
    throw error;
  }

  const meta = readMeta();
  const newUser = {
    id: meta.nextUserId,
    firstName: String(firstName || "").trim(),
    lastName: String(lastName || "").trim(),
    email: normalizedEmail,
    passwordHash,
    roles: [{ id: 1, name: "GREEN" }],
    createdAt: new Date().toISOString(),
  };

  meta.nextUserId += 1;
  writeMeta(meta);
  records.push(newUser);
  writeAllRecords(records);

  return toPublicUser(newUser);
};

export const updateLocalUser = (id, patch) => {
  const records = ensureLocalUsersSeeded();
  const index = records.findIndex((u) => String(u.id) === String(id));
  if (index === -1) return null;

  records[index] = {
    ...records[index],
    ...patch,
    email: patch.email ? normalizeEmail(patch.email) : records[index].email,
  };

  writeAllRecords(records);
  return toPublicUser(records[index]);
};

export const deleteLocalUser = (id) => {
  const records = ensureLocalUsersSeeded();
  const next = records.filter((u) => String(u.id) !== String(id));
  writeAllRecords(next);
};

export const getAllLocalUserRecords = () => ensureLocalUsersSeeded();
