const toHex = (buffer) =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

/** Запасной хеш, если crypto.subtle недоступен (например, http://192.168.x.x) */
const fallbackHash = (password) => {
  let hash = 5381;
  for (let i = 0; i < password.length; i += 1) {
    hash = (hash * 33) ^ password.charCodeAt(i);
  }
  return `fallback-${(hash >>> 0).toString(16)}`;
};

export const hashPassword = async (password) => {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    try {
      const data = new TextEncoder().encode(password);
      const digest = await crypto.subtle.digest("SHA-256", data);
      return toHex(digest);
    } catch {
      return fallbackHash(password);
    }
  }
  return fallbackHash(password);
};

export const verifyPassword = async (password, passwordHash) => {
  if (!passwordHash) return false;
  const hash = await hashPassword(password);
  return hash === passwordHash;
};
