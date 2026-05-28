import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../scss/pages/eventDetails.module.scss";
import { useTheme } from "../store/useTheme";
import { useApi } from "../hooks/useApi";
import { useAuthStore } from "../store/authStore";
import { formatDateRu, formatTimeRu } from "../utils/date";
import { subscribeToEventsUpdates } from "../utils/eventsSync";
import { getRoleColor, getRoleLabel, sortRolesByPriority } from "../utils/roles";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { apiCall } = useApi();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvent = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await apiCall(`/events/${id}`);
      setEvent(data);
    } catch (err) {
      setError(err.message || "Ошибка загрузки мероприятия");
    } finally {
      setLoading(false);
    }
  }, [apiCall, id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  useEffect(() => {
    const unsubscribe = subscribeToEventsUpdates(() => fetchEvent());
    return unsubscribe;
  }, [fetchEvent]);

  const isRegistered = useMemo(() => {
    if (!user?.id || !Array.isArray(event?.participants)) return false;
    const currentUserId = String(user.id);

    return event.participants.some((participant) => {
      if (participant && typeof participant === "object") {
        return String(participant.id) === currentUserId;
      }
      return String(participant) === currentUserId;
    });
  }, [event?.participants, user?.id]);

  const handleToggleRegistration = useCallback(async () => {
    if (!event?.id) return;

    if (!user?.id || !token) {
      setError("Нужно войти в аккаунт заново, чтобы записаться на мероприятие.");
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      const endpoint = `/events/${event.id}/${isRegistered ? "quit" : "join"}`;
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

      await fetchEvent();
    } catch (err) {
      if (String(err?.message || "").includes("403")) {
        setError("Нет доступа к записи на мероприятие. Проверь вход в аккаунт.");
      } else {
        setError(err.message || "Не удалось изменить регистрацию на мероприятие");
      }
    } finally {
      setActionLoading(false);
    }
  }, [apiCall, event?.id, fetchEvent, isRegistered, token, user?.id]);

  return (
    <div className={theme === "black" ? styles.page : `${styles.page} ${styles.pageLight}`}>
      <Header />

      <main className={styles.container}>
        <button
          type="button"
          className={theme === "black" ? styles.backButton : `${styles.backButton} ${styles.backButtonLight}`}
          onClick={() => navigate(-1)}
        >
          <img src={theme === "black" ? "/img/back.svg" : "/img/backBleack.svg"} alt="back" />
          <span>Назад</span>
        </button>

        {loading && <p className={styles.info}>Загрузка...</p>}
        {error && <p className={styles.error}>{error}</p>}

        {!loading && event && (
          <section className={theme === "black" ? styles.card : `${styles.card} ${styles.cardLight}`}>
            <h1 className={styles.title}>{event.title}</h1>

            <p className={styles.meta}>
              {formatDateRu(event.plannedAt, undefined, "Дата не указана")} в{" "}
              {formatTimeRu(
                event.plannedAt,
                { hour: "2-digit", minute: "2-digit" },
                "—"
              )}
            </p>

            <p className={styles.description}>{event.description}</p>

            <p className={styles.manager}>
              Организатор: {event.manager?.firstName} {event.manager?.lastName}
            </p>
            {!!event.manager?.roles?.length && (
              <div className={styles.rolesRow}>
                {sortRolesByPriority(event.manager.roles).map((role) => {
                  const roleColor = getRoleColor(role);
                  return (
                    <span
                      key={role.id}
                      className={styles.roleBadge}
                      style={
                        roleColor
                          ? {
                              backgroundColor: roleColor.background,
                              borderColor: roleColor.border,
                              color: roleColor.text,
                            }
                          : undefined
                      }
                    >
                      {getRoleLabel(role)}
                    </span>
                  );
                })}
              </div>
            )}

            {user?.id && token && (
              <button
                type="button"
                className={isRegistered ? `${styles.actionButton} ${styles.cancelButton}` : styles.actionButton}
                onClick={handleToggleRegistration}
                disabled={actionLoading}
              >
                {actionLoading
                  ? "Обработка..."
                  : isRegistered
                    ? "Отменить регистрацию"
                    : "Зарегистрироваться"}
              </button>
            )}

            <h2 className={styles.participantsTitle}>
              Участники ({event.participants?.length || 0})
            </h2>

            <ul className={styles.participantsList}>
              {(event.participants || []).map((participant) => (
                <li key={participant.id} className={styles.participantItem}>
                  <span className={styles.participantName}>
                    {participant.firstName} {participant.lastName}
                  </span>
                  <span className={styles.participantEmail}>{participant.email}</span>
                  {!!participant.roles?.length && (
                    <div className={styles.rolesRow}>
                      {sortRolesByPriority(participant.roles).map((role) => {
                        const roleColor = getRoleColor(role);
                        return (
                          <span
                            key={role.id}
                            className={styles.roleBadge}
                            style={
                              roleColor
                                ? {
                                    backgroundColor: roleColor.background,
                                    borderColor: roleColor.border,
                                    color: roleColor.text,
                                  }
                                : undefined
                            }
                          >
                            {getRoleLabel(role)}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </li>
              ))}
              {(!event.participants || event.participants.length === 0) && (
                <li className={styles.participantEmpty}>Пока никто не зарегистрирован</li>
              )}
            </ul>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default EventDetails;
