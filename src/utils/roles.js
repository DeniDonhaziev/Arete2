import { ROLE_COLORS, ROLE_LABELS, ROLE_PRIORITY } from "../constants/roles";
import { isAdminEmail } from "../config/adminAccount";

const normalizeRoleName = (role) => {
  if (!role) return null;

  const raw = typeof role === "string" ? role : role.name || role.authority;
  if (!raw) return null;

  return raw.startsWith("ROLE_") ? raw : `ROLE_${raw}`;
};

export const getRoleLabel = (role) => {
  const normalized = normalizeRoleName(role);
  if (!normalized) return "UNKNOWN";
  return ROLE_LABELS[normalized] || normalized.replace("ROLE_", "");
};

export const hasRole = (userOrRoles, roleName) => {
  const normalizedTarget = normalizeRoleName(roleName);
  if (!normalizedTarget) return false;

  const roles = Array.isArray(userOrRoles)
    ? userOrRoles
    : userOrRoles?.roles || [];

  return roles.some((role) => normalizeRoleName(role) === normalizedTarget);
};

/** Администратор клуба (ROLE_RED или служебный email) */
export const isAdmin = (user) => {
  if (isAdminEmail(user?.email)) return true;
  return hasRole(user, "RED");
};

export const sortRolesByPriority = (roles = []) => {
  return [...roles].sort((a, b) => {
    const aKey = normalizeRoleName(a);
    const bKey = normalizeRoleName(b);
    const aPriority = ROLE_PRIORITY[aKey] || 0;
    const bPriority = ROLE_PRIORITY[bKey] || 0;
    return bPriority - aPriority;
  });
};

export const getHighestRoleLabel = (roles = []) => {
  const sorted = sortRolesByPriority(roles);
  if (!sorted.length) return null;
  return getRoleLabel(sorted[0]);
};

export const getRoleColor = (role) => {
  const normalized = normalizeRoleName(role);
  if (!normalized) return null;
  return ROLE_COLORS[normalized] || null;
};
