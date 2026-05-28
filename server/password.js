import { createHash } from "crypto";

export const hashPassword = async (password) => {
  return createHash("sha256").update(String(password)).digest("hex");
};

export const verifyPassword = async (password, passwordHash) => {
  if (!passwordHash) return false;
  const hash = await hashPassword(password);
  return hash === passwordHash;
};
