/** Ключ localStorage — один список мероприятий для всех пользователей на этом сайте */
export const EVENTS_STORAGE_KEY = "arete-local-events";

export const EVENTS_UPDATED = "arete-events-updated";

export const notifyEventsUpdated = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENTS_UPDATED));
  }
};

/** Обновление списка в этой вкладке и в других вкладках/окнах того же браузера */
export const subscribeToEventsUpdates = (callback) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const onStorage = (event) => {
    if (event.key === EVENTS_STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener(EVENTS_UPDATED, callback);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(EVENTS_UPDATED, callback);
    window.removeEventListener("storage", onStorage);
  };
};
