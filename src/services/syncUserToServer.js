import apiCall from "../API/apiClient";
import { findLocalUserByEmail, readAllRecords } from "./localUsersStorage";

/** Сохраняет пользователя в общую базу (видно в админке из любого браузера) */
export const syncUserRecordToServer = async (record) => {
  if (!record?.email) return;

  try {
    await apiCall("/users/sync", {
      method: "POST",
      body: JSON.stringify({
        id: record.id,
        firstName: record.firstName,
        lastName: record.lastName,
        email: record.email,
        passwordHash: record.passwordHash,
        roles: record.roles,
        createdAt: record.createdAt,
      }),
    });
  } catch (err) {
    console.warn("Не удалось синхронизировать пользователя с сервером:", err.message);
  }
};

export const syncAllLocalUsersToServer = async () => {
  const records = readAllRecords();
  for (const record of records) {
    await syncUserRecordToServer(record);
  }
};

export const syncUserByEmailToServer = async (email) => {
  const record = findLocalUserByEmail(email);
  if (record) {
    await syncUserRecordToServer(record);
  }
};
