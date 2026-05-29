import apiCall from "../API/apiClient";
import { findLocalUserByEmail, readAllRecords } from "./localUsersStorage";

/** Сохраняет пользователя в общую базу (видно в админке и на /rating) */
export const syncUserRecordToServer = async (record, { throwOnError = false } = {}) => {
  if (!record?.email) return null;

  try {
    return await apiCall("/users/sync", {
      method: "POST",
      body: JSON.stringify({
        id: record.id,
        firstName: record.firstName,
        lastName: record.lastName,
        email: record.email,
        passwordHash: record.passwordHash || "",
        roles: record.roles,
        createdAt: record.createdAt || new Date().toISOString(),
      }),
    });
  } catch (err) {
    const message =
      err.message ||
      "Не удалось сохранить профиль на сервере клуба (админка и рейтинг).";

    if (throwOnError) {
      const error = new Error(message);
      error.cause = err;
      throw error;
    }

    console.warn("Не удалось синхронизировать пользователя с сервером:", message);
    return null;
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
