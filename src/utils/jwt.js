const decodeBase64Url = (value) => {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return atob(padded);
  } catch {
    return null;
  }
};

export const parseJwtPayload = (token) => {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;

  const decoded = decodeBase64Url(parts[1]);
  if (!decoded) return null;

  try {
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

export const getTokenExpiryMs = (token) => {
  const payload = parseJwtPayload(token);
  const exp = payload?.exp;
  if (!exp || Number.isNaN(Number(exp))) return null;
  return Number(exp) * 1000;
};

export const isTokenExpired = (token) => {
  const expiryMs = getTokenExpiryMs(token);
  if (!expiryMs) return false;
  return Date.now() >= expiryMs;
};
