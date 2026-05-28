import { useCallback, useEffect, useState } from "react";
import apiCall from "../API/apiClient";
import { subscribeToEventsUpdates } from "../utils/eventsSync";

const sortByDate = (list) =>
  [...(Array.isArray(list) ? list : [])].sort(
    (a, b) => new Date(a.plannedAt).getTime() - new Date(b.plannedAt).getTime()
  );

/** Общий список мероприятий с сервера — одинаковый во всех браузерах */
export const fetchPublicEvents = async () => {
  const data = await apiCall("/events");
  return sortByDate(data);
};

export const usePublicEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchPublicEvents();
      setEvents(list);
      return list;
    } catch (err) {
      setEvents([]);
      const message =
        err.status === 500 || err.status === 503
          ? "Сервер мероприятий недоступен. Запустите: npm run dev"
          : err.message || "Не удалось загрузить мероприятия";
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
    const unsubscribe = subscribeToEventsUpdates(refetch);
    const onFocus = () => refetch();
    const intervalId = window.setInterval(refetch, 30000);
    window.addEventListener("focus", onFocus);
    return () => {
      unsubscribe();
      window.removeEventListener("focus", onFocus);
      window.clearInterval(intervalId);
    };
  }, [refetch]);

  return { events, loading, error, refetch };
};
