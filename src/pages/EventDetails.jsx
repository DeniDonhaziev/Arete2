import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../scss/pages/eventDetails.module.scss";
import { useApi } from "../hooks/useApi";
import { useAuthStore } from "../store/authStore";
import { formatDateRu, formatTimeRu } from "../utils/date";
import { subscribeToEventsUpdates } from "../utils/eventsSync";
import {
  buildJoinPayloadFromUser,
  getParticipantDisplayName,
  getParticipantInitials,
} from "../utils/participant";
import { getRoleColor, getRoleLabel, sortRolesByPriority } from "../utils/roles";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const eventDateBadge = useMemo(() => {
    if (!event?.plannedAt) return null;
    const date = new Date(event.plannedAt);
    if (Number.isNaN(date.getTime())) return null;

    return {
      day: date.getDate(),
      month: date.toLocaleDateString("ru-RU", { month: "short" }).replace(".", ""),
    };
  }, [event?.plannedAt]);

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
      const joinBody = isRegistered ? undefined : buildJoinPayloadFromUser(user);
      const methodsToTry = ["PATCH", "POST"];
      let done = false;
      let lastError = null;

      for (const method of methodsToTry) {
        try {
          await apiCall(endpoint, {
            method,
            body: joinBody ? JSON.stringify(joinBody) : undefined,
          });
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
  }, [apiCall, event?.id, fetchEvent, isRegistered, token, user]);

  const organizerName = [event?.manager?.firstName, event?.manager?.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.container}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate(-1)}
        >
          <img src="/img/back.svg" alt="" aria-hidden="true" />
          <span>Назад</span>
        </button>

        {loading && <p className={styles.info}>Загрузка...</p>}
        {error && <p className={styles.error}>{error}</p>}

        {!loading && event && (
          <section className={styles.card}>
            <div className={styles.heroTop}>
              {eventDateBadge && (
                <div className={styles.dateBadge} aria-hidden="true">
                  <strong>{eventDateBadge.day}</strong>
                  <span>{eventDateBadge.month}</span>
                </div>
              )}
              <h1 className={styles.title}>{event.title}</h1>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.metaChip}>
                {formatDateRu(event.plannedAt, undefined, "Дата не указана")}
              </span>
              <span className={styles.metaChip}>
                {formatTimeRu(
                  event.plannedAt,
                  { hour: "2-digit", minute: "2-digit" },
                  "—"
                )}
              </span>
            </div>

            {event.description && (
              <p className={styles.description}>{event.description}</p>
            )}

            {organizerName && (
              <div className={styles.organizerBlock}>
                <span className={styles.organizerLabel}>Организатор</span>
                <p className={styles.organizerName}>{organizerName}</p>
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
              </div>
            )}

            {user?.id && token && (
              <button
                type="button"
                className={
                  isRegistered
                    ? `${styles.actionButton} ${styles.cancelButton}`
                    : styles.actionButton
                }
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

            <div className={styles.participantsSection}>
              <h2 className={styles.participantsTitle}>
                Участники{" "}
                <span className={styles.participantsCount}>
                  ({event.participants?.length || 0})
                </span>
              </h2>

              <ul className={styles.participantsGrid}>
                {(event.participants || []).map((participant) => {
                  const participantKey = String(participant.id);
                  const displayName = getParticipantDisplayName(participant);

                  return (
                    <li key={participantKey} className={styles.participantChip}>
                      <span className={styles.participantAvatar} aria-hidden="true">
                        {getParticipantInitials(participant)}
                      </span>
                      <div className={styles.participantInfo}>
                        <span className={styles.participantName}>{displayName}</span>
                        {participant.email && (
                          <span className={styles.participantEmail}>
                            {participant.email}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              {(!event.participants || event.participants.length === 0) && (
                <p className={styles.participantEmpty}>
                  Пока никто не зарегистрирован — будьте первым
                </p>
              )}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default EventDetails;
