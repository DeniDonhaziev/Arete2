const isValidDate = (date) => date instanceof Date && !Number.isNaN(date.getTime());

export const parseDate = (value) => {
  if (value == null || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  return isValidDate(date) ? date : null;
};

export const toIsoDate = (value) => {
  const date = parseDate(value);
  return (date ?? new Date()).toISOString();
};

/** Значение для input[type="datetime-local"] */
export const toDatetimeLocalValue = (value) => {
  const date = parseDate(value);
  if (!date) return "";

  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const formatDateRu = (value, options, fallback = "—") => {
  const date = parseDate(value);
  if (!date) return fallback;
  try {
    return date.toLocaleDateString("ru-RU", options);
  } catch {
    return fallback;
  }
};

export const formatDateTimeRu = (value, fallback = "—") => {
  const date = parseDate(value);
  if (!date) return fallback;
  try {
    return date.toLocaleString("ru-RU");
  } catch {
    return fallback;
  }
};

export const formatTimeRu = (value, options, fallback = "") => {
  const date = parseDate(value);
  if (!date) return fallback;
  try {
    return date.toLocaleTimeString("ru-RU", options);
  } catch {
    return fallback;
  }
};

export const isValidDateInput = (value) => parseDate(value) != null;
