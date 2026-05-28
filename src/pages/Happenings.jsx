import { useEffect, useMemo, useCallback, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Search from "../components/Search";
import styles from "../scss/pages/happenings.module.scss";
import { useTheme } from "../store/useTheme";
import { useApi } from "../hooks/useApi";
import { formatDateRu, formatTimeRu } from "../utils/date";
import { usePublicEvents } from "../hooks/usePublicEvents";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

const Happenings = () => {
  const { theme } = useTheme();
  const { apiCall } = useApi();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  const { events, loading, error: loadError, refetch } = usePublicEvents();
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoading, setShowLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchEvents = refetch;

  useEffect(() => {
    let timeoutId;

    if (loading) {
      timeoutId = setTimeout(() => {
        setShowLoading(true);
      }, 1000);
    } else {
      setShowLoading(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [loading]);

  const isUserRegisteredForEvent = useCallback(
    (event) => {
      if (!user?.id || !Array.isArray(event?.participants)) {
        return false;
      }

      const currentUserId = String(user.id);

      return event.participants.some((participant) => {
        if (participant && typeof participant === "object") {
          return String(participant.id) === currentUserId;
        }

        return String(participant) === currentUserId;
      });
    },
    [user?.id]
  );

  const handleToggleRegistration = useCallback(
    async (eventId, isRegistered) => {
      if (!user?.id || !token) {
        setError("Нужно войти в аккаунт заново, чтобы записаться на мероприятие.");
        return;
      }

      try {
        setActionLoadingId(eventId);
        const endpoint = `/events/${eventId}/${isRegistered ? "quit" : "join"}`;
        const methodsToTry = ["PATCH", "POST"];
        let done = false;
        let lastError = null;

        for (const method of methodsToTry) {
          try {
            await apiCall(endpoint, { method });
            done = true;
            break;
          } catch (err) {
            lastError = err;
            const status = Number(err?.status || 0);
            if (status !== 403 && status !== 405) {
              throw err;
            }
          }
        }

        if (!done && lastError) {
          throw lastError;
        }

        await fetchEvents();
      } catch (err) {
        console.error("Event registration failed", {
          eventId,
          action: isRegistered ? "quit" : "join",
          status: err?.status,
          message: err?.message,
          response: err?.data,
        });
        if (String(err?.message || "").includes("403")) {
          setError("Нет доступа к записи на мероприятие. Проверь вход в аккаунт.");
        } else {
          setError(err.message || "Не удалось изменить регистрацию на мероприятие");
        }
      } finally {
        setActionLoadingId(null);
      }
    },
    [apiCall, fetchEvents, user?.id, token]
  );

  // 🔎 Live фильтрация
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;

    const lower = searchQuery.toLowerCase();

    return events.filter((event) =>
      (event.title || "").toLowerCase().includes(lower) ||
      (event.description || "").toLowerCase().includes(lower)
    );
  }, [events, searchQuery]);

  return (
    <div className={styles.container}>
      <Header />

      <h1 className={styles.titleEvents}>Мероприятия</h1>

      {/* 🔎 Поиск */}
      <Search value={searchQuery} onChange={setSearchQuery} />

      {showLoading && <p style={{ textAlign: "center" }}>Загрузка...</p>}
      {(error || loadError) && (
        <p style={{ color: "red", textAlign: "center" }}>{error || loadError}</p>
      )}

      {!loading && events.length === 0 && (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>Пока нет мероприятий</p>
          <p className={styles.emptyText}>
            Администратор добавит их в клубе. Список общий для всех браузеров —
            нажмите «Обновить», если мероприятие только что создано.
          </p>
          <button
            type="button"
            className={styles.refreshButton}
            onClick={() => refetch()}
          >
            Обновить
          </button>
        </div>
      )}

      {!loading && events.length > 0 && filteredEvents.length === 0 && (
        <p className={styles.emptySearch}>По вашему запросу ничего не найдено</p>
      )}

      {filteredEvents.length > 0 && (
      <div
        className={
          theme === "black"
            ? styles.visualBackdrop
            : `${styles.visualBackdrop} ${styles.visualBackdropColor}`
        }
      >
        {filteredEvents.map((event) => {
          const isRegistered = isUserRegisteredForEvent(event);

          return (
            <div
              key={event.id}
              className={
                theme === "black"
                  ? `${styles.subtextOfTheEvent} ${styles.cardClickable}`
                  : `${styles.subtextOfTheEvent} ${styles.subtextOfColor} ${styles.cardClickable}`
              }
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/happenings/${event.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/happenings/${event.id}`);
                }
              }}
            >
              <div className={styles.suvent}>
                <article>
                  <p>
                    <strong className={styles.monstratStyls400}>
                      {event.title}
                    </strong>
                  </p>
                  <p className={`${styles.monstratStyls300} ${styles.eventDescription}`}>
                    {event.description}
                  </p>
                </article>

                <article className={styles.timeRangeDate}>
                  <div className={styles.eventMetaRow}>
                    <p className={styles.monstratStyls300}>
                      {formatDateRu(event.plannedAt)}{" "}
                      {formatTimeRu(event.plannedAt, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                    <div className={styles.usersIcon}>
                      <img src="/img/usersIcons.svg" alt="usersIcons" />
                      <span className={styles.numberUsers}>
                        {(event.participants ?? []).length}
                      </span>
                    </div>
                  </div>

                  {user?.id && token && (
                    <button
                      type="button"
                      className={
                        isRegistered
                          ? `${styles.eventActionButton} ${styles.eventCancelButton}`
                          : styles.eventActionButton
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleRegistration(event.id, isRegistered);
                      }}
                      disabled={actionLoadingId === event.id}
                    >
                      {actionLoadingId === event.id
                        ? "Обработка..."
                        : isRegistered
                          ? "Отменить"
                          : "Зарегистрироваться"}
                    </button>
                  )}
                </article>
              </div>
            </div>
          );
        })}
      </div>
      )}

      <Footer />
    </div>
  );
};

export default Happenings;
