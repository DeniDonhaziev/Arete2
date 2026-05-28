import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_PROFILE,
} from "../config/adminAccount";
import { ROLE_IDS } from "../constants/roles";
import { hashPassword } from "../utils/password";
import {
  ensureLocalUsersSeeded,
  readAllRecords,
  writeAllRecords,
} from "./localUsersStorage";
import { syncUserRecordToServer } from "./syncUserToServer";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

/** Создаёт или обновляет отдельную учётку администратора с паролем */
export const ensureAdminAccount = async () => {
  ensureLocalUsersSeeded();

  const email = normalizeEmail(ADMIN_EMAIL);
  const passwordHash = await hashPassword(ADMIN_PASSWORD);
  const records = readAllRecords();
  const index = records.findIndex((u) => normalizeEmail(u.email) === email);

  const adminRecord = {
    id: index >= 0 ? records[index].id : 1,
    firstName: ADMIN_PROFILE.firstName,
    lastName: ADMIN_PROFILE.lastName,
    email,
    passwordHash,
    roles: [{ id: ROLE_IDS.RED, name: "RED" }],
    createdAt: records[index]?.createdAt || new Date().toISOString(),
  };

  if (index >= 0) {
    records[index] = { ...records[index], ...adminRecord };
  } else {
    records.unshift(adminRecord);
  }

  writeAllRecords(records);
  await syncUserRecordToServer(adminRecord);
  return adminRecord;
};
