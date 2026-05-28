import styles from "../scss/components/slayderSessions.module.scss";
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSliderEvents } from "../API/UseSliderLogic";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../store/useTheme";
import { formatDateRu, formatTimeRu } from "../utils/date";
import { subscribeToEventsUpdates } from "../utils/eventsSync";

const SlayderSessions = function () {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const userId = useAuthStore((state) => state.user?.id);
  const {
    slaiderTime,
    setEventsPlus,
    setEventsMinus,
    numberMas,
    fetchSliderEvents,
    loading,
    error,
  } = useSliderEvents();
  const currentSlide = slaiderTime?.[numberMas];
  const isDark = theme === "black";
  const backdropClass = isDark
    ? styles.visualBackdrop
    : `${styles.visualBackdrop} ${styles.visualBackdropColor}`;

  useEffect(() => {
    fetchSliderEvents();
  }, [fetchSliderEvents, location.pathname, userId]);

  useEffect(() => {
    const refresh = () => fetchSliderEvents();
    const unsubscribe = subscribeToEventsUpdates(refresh);
    window.addEventListener("focus", refresh);
    return () => {
      unsubscribe();
      window.removeEventListener("focus", refresh);
    };
  }, [fetchSliderEvents]);

  if (loading) {
    return (
      <div className={backdropClass}>
        <p style={{ textAlign: "center" }}>Загрузка мероприятий...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={backdropClass}>
        <p style={{ color: "red", textAlign: "center" }}>
          {typeof error === "string" ? error : error?.message || "Ошибка загрузки"}
        </p>
      </div>
    );
  }

  if (!slaiderTime?.length || !currentSlide) {
    return (
      <div className={backdropClass}>
        <h4
          className={
            isDark ? styles.titleEvents : `${styles.titleEvents} ${styles.titleColor}`
          }
        >
          Мероприятия
        </h4>
        <p style={{ textAlign: "center", color: "var(--text-muted, #888)" }}>
          Пока нет мероприятий. Администратор добавит их в админ-панели.{" "}
          <Link to="/happenings">Перейти в раздел</Link>
        </p>
      </div>
    );
  }

  const openEvent = () => {
    if (currentSlide?.id != null) {
      navigate(`/happenings/${currentSlide.id}`);
    } else {
      navigate("/happenings");
    }
  };

  return (
    <div className={backdropClass}>
      <div className={styles.eventsHead}>
        <h4
          className={
            isDark ? styles.titleEvents : `${styles.titleEvents} ${styles.titleColor}`
          }
        >
          Мероприятия
        </h4>
        <Link to="/happenings" className={styles.eventsAllLink}>
          Все мероприятия →
        </Link>
      </div>

      <div
        className={
          isDark ? styles.subtextOfTheEvent : `${styles.subtextOfTheEvent} ${styles.subtextColor}`
        }
      >
        <nav
          className={
            isDark ? styles.leftArrow : `${styles.leftArrow} ${styles.arrowColor}`
          }
        >
          <button type="button" onClick={setEventsMinus} aria-label="Предыдущее">
            ‹
          </button>
        </nav>

        <div
          style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
          onClick={openEvent}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openEvent();
            }
          }}
          role="button"
          tabIndex={0}
        >
          <article>
            <p>
              <strong className={styles.monstratStyls400}>
                {currentSlide.title || "Без названия"}
              </strong>
            </p>
            <p className={`${styles.monstratStyls300} ${styles.positionSlaiderFiks}`}>
              {currentSlide.description || "Описание отсутствует"}
            </p>
          </article>

          <article className={styles.timeRangeDate}>
            <p className={styles.monstratStyls300}>
              {currentSlide.plannedAt
                ? `${formatDateRu(currentSlide.plannedAt, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })} в ${formatTimeRu(currentSlide.plannedAt, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "Дата не указана"}
            </p>
          </article>
        </div>

        <nav
          className={
            isDark ? styles.rightArrow : `${styles.rightArrow} ${styles.arrowColor}`
          }
        >
          <button type="button" onClick={setEventsPlus} aria-label="Следующее">
            ›
          </button>
        </nav>
      </div>
    </div>
  );
};

export default SlayderSessions;
