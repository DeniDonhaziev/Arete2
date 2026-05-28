import React from "react";
import styles from "../../scss/components/Admin/adminArticleCard.module.scss";

const STATUS_LABELS = {
  pending: "На модерации",
  approved: "Подтверждено",
  rejected: "Отклонено",
};

// SVG-иконки (такие же, как в статьях)
const EditIcon = (props) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z" />
  </svg>
);

const TrashIcon = (props) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

const CheckIcon = (props) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CloseIcon = (props) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const AdminEventCard = ({
  id,
  title,
  type,       // 'Мероприятие' | 'Онлайн' | ...
  author,     // сюда можно передать "Организатор: ..."
  createdAt,  // дата проведения / создания — как тебе удобно
  status,     // 'pending' | 'approved' | 'rejected'
  excerpt,    // краткое описание
  onApprove,
  onReject,
  onEdit,
  onDelete,
  onOpen,
}) => {
  const statusLabel = STATUS_LABELS[status] ?? status;

  return (
    <article className={styles.card}>
      {/* ВЕРХНЯЯ СТРОКА: тип, организатор, статус */}
      <header className={styles.header}>
        <div className={styles.metaLeft}>
          <span className={styles.type}>{type}</span>
          <span className={styles.dot}>•</span>
          <span className={styles.author}>{author}</span>
        </div>

        <div
          className={
            styles.status +
            " " +
            (status === "pending"
              ? styles.statusPending
              : status === "approved"
              ? styles.statusApproved
              : styles.statusRejected)
          }
        >
          {statusLabel}
        </div>
      </header>

      {/* КОНТЕНТ: клик по карточке = открыть мероприятие */}
      <section className={styles.body} onClick={() => onOpen?.(id)}>
        <h3 className={styles.title}>{title}</h3>
        {excerpt && (
          <p className={styles.excerpt}>
            {excerpt.length > 220 ? excerpt.slice(0, 220) + "…" : excerpt}
          </p>
        )}
      </section>

      {/* НИЖНЯЯ СТРОКА: дата + действия + модерация */}
      <footer className={styles.footer}>
        <span className={styles.date}>{createdAt}</span>

        <div className={styles.footerRight}>
          <div className={styles.iconActions}>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => onEdit?.(id)}
              aria-label="Редактировать мероприятие"
            >
              <EditIcon />
            </button>

            <button
              type="button"
              className={styles.iconButton + " " + styles.iconDanger}
              onClick={() => onDelete?.(id)}
              aria-label="Удалить мероприятие"
            >
              <TrashIcon />
            </button>
          </div>

          {status === "pending" && (
            <div className={styles.moderation}>
              <span className={styles.moderationLabel}>Быстрая модерация</span>
              <button
                type="button"
                className={
                  styles.moderationBtn + " " + styles.moderationApprove
                }
                onClick={() => onApprove?.(id)}
                aria-label="Подтвердить мероприятие"
              >
                <CheckIcon />
              </button>
              <button
                type="button"
                className={
                  styles.moderationBtn + " " + styles.moderationReject
                }
                onClick={() => onReject?.(id)}
                aria-label="Отклонить мероприятие"
              >
                <CloseIcon />
              </button>
            </div>
          )}
        </div>
      </footer>
    </article>
  );
};

export default AdminEventCard;
