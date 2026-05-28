import React from "react";
import styles from "../../scss/components/Admin/adminArticleCard.module.scss";

const STATUS_LABELS = {
  pending: "Ожидает подтверждения",
  approved: "Активен",
  blocked: "Заблокирован",
};

const normalizeRole = (role) => {
  const r = (role || "").toLowerCase();
  if (r.startsWith("зол")) return "gold";
  if (r.startsWith("сер")) return "silver";
  if (r.startsWith("брон")) return "bronze";
  return "bronze";
};

const ROLE_LABELS = {
  gold: "Золотой",
  silver: "Серебряный",
  bronze: "Бронзовый",
};

// SVG-иконки такие же, как у статей
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

const AdminUserCard = ({
  id,
  first_name,
  last_name,
  rating,
  role,
  is_card,
  status,         // 'pending' | 'approved' | 'blocked' (или что-то похожее)
  createdAt,      // дата регистрации, если есть
  onApprove,
  onReject,
  onEdit,
  onDelete,
  onOpen,
  onChangeRole,   // (id, 'gold' | 'silver' | 'bronze')
}) => {
  const normalizedRole = normalizeRole(role);
  const roleLabel = ROLE_LABELS[normalizedRole] ?? role;
  const statusLabel = STATUS_LABELS[status] ?? status ?? "—";

  const fullName = [first_name, last_name].filter(Boolean).join(" ") || "Без имени";

  return (
    <article className={styles.card}>
      {/* ВЕРХНЯЯ СТРОКА: имя, id, статус */}
      <header className={styles.header}>
        <div className={styles.metaLeft}>
          <span className={styles.userName}>{fullName}</span>
          <span className={styles.dot}>•</span>
          <span className={styles.userId}>ID: {id}</span>
        </div>

        <div
          className={
            styles.status +
            " " +
            (status === "pending"
              ? styles.statusPending
              : status === "approved"
              ? styles.statusApproved
              : status === "blocked"
              ? styles.statusRejected
              : "")
          }
        >
          {statusLabel}
        </div>
      </header>

      {/* КОНТЕНТ: клик по карточке = открыть пользователя */}
      <section className={styles.body} onClick={() => onOpen?.(id)}>
        <div className={styles.userInfo}>
          <p className={styles.userInfoLine}>
            <span className={styles.userInfoLabel}>Уровень: </span>
            <span
              className={
                styles.userRoleBadge +
                " " +
                (normalizedRole === "gold"
                  ? styles.roleGold
                  : normalizedRole === "silver"
                  ? styles.roleSilver
                  : styles.roleBronze)
              }
            >
              {roleLabel}
            </span>
          </p>

          <p className={styles.userInfoLine}>
            <span className={styles.userInfoLabel}>Рейтинг: </span>
            <span className={styles.userHighlight}>
              {typeof rating === "number" ? rating.toFixed(1) : "—"}
            </span>
          </p>

          <p className={styles.userInfoLine}>
            <span className={styles.userInfoLabel}>Карточка: </span>
            <span className={styles.userHighlight}>
              {is_card ? "выдана" : "не выдана"}
            </span>
          </p>

          {createdAt && (
            <p className={styles.userInfoLine}>
              <span className={styles.userInfoLabel}>Дата регистрации: </span>
              <span className={styles.userHighlight}>{createdAt}</span>
            </p>
          )}
        </div>
      </section>

      {/* НИЖНЯЯ СТРОКА: быстрые действия + модерация + смена роли */}
      <footer className={styles.footer}>
        <div className={styles.userFooterLeft}>
          <span className={styles.userFooterLabel}>Управление пользователем</span>
        </div>

        <div className={styles.footerRight}>
          {/* Иконки редактирования/удаления */}
          <div className={styles.iconActions}>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => onEdit?.(id)}
              aria-label="Редактировать пользователя"
            >
              <EditIcon />
            </button>

            <button
              type="button"
              className={styles.iconButton + " " + styles.iconDanger}
              onClick={() => onDelete?.(id)}
              aria-label="Удалить пользователя"
            >
              <TrashIcon />
            </button>
          </div>

          {/* Быстрая смена роли */}
          <div className={styles.roleQuick}>
            <span className={styles.roleQuickLabel}>Уровень:</span>
            <button
              type="button"
              className={
                styles.rolePill +
                " " +
                (normalizedRole === "gold" ? styles.rolePillActiveGold : "")
              }
              onClick={() => onChangeRole?.(id, "gold")}
            >
              Зол
            </button>
            <button
              type="button"
              className={
                styles.rolePill +
                " " +
                (normalizedRole === "silver" ? styles.rolePillActiveSilver : "")
              }
              onClick={() => onChangeRole?.(id, "silver")}
            >
              Сер
            </button>
            <button
              type="button"
              className={
                styles.rolePill +
                " " +
                (normalizedRole === "bronze" ? styles.rolePillActiveBronze : "")
              }
              onClick={() => onChangeRole?.(id, "bronze")}
            >
              Бронз
            </button>
          </div>

          {/* Подтверждение регистрации (если статус pending) */}
          {status === "pending" && (
            <div className={styles.moderation}>
              <span className={styles.moderationLabel}>Регистрация</span>
              <button
                type="button"
                className={
                  styles.moderationBtn + " " + styles.moderationApprove
                }
                onClick={() => onApprove?.(id)}
                aria-label="Подтвердить пользователя"
              >
                <CheckIcon />
              </button>
              <button
                type="button"
                className={
                  styles.moderationBtn + " " + styles.moderationReject
                }
                onClick={() => onReject?.(id)}
                aria-label="Отклонить пользователя"
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

export default AdminUserCard;
