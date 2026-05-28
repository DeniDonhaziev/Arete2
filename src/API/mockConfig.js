/** В dev всегда локальный режим; на проде — mock, если не выключен явно */
export const USE_MOCK_API =
  import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_API !== "false";
