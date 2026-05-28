import styles from "../../scss/components/Admin/adminArticleCard.module.scss";

const STATUS_LABELS = {
  pending: "На модерации",
  approved: "В газете",
  rejected: "Отклонено",
};

const AdminArticleCard = ({
  id,
  title,
  type,
  author,
  createdAt,
  status,
  excerpt,
  onApprove,
  onReject,
  onEdit,
  onDelete,
}) => {
  const statusLabel = STATUS_LABELS[status] ?? status;
  const isPending = status === "pending";
  const isApproved = status === "approved";
  const isRejected = status === "rejected";

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div className={styles.metaLeft}>
          <span className={styles.type}>{type}</span>
          <span className={styles.dot}>•</span>
          <span className={styles.author}>{author}</span>
        </div>

        <div
          className={`${styles.status} ${
            isPending
              ? styles.statusPending
              : isApproved
              ? styles.statusApproved
              : styles.statusRejected
          }`}
        >
          {statusLabel}
        </div>
      </header>

      <section className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        {excerpt && (
          <p className={styles.excerpt}>
            {excerpt.length > 220 ? `${excerpt.slice(0, 220)}…` : excerpt}
          </p>
        )}
      </section>

      <footer className={styles.footer}>
        <span className={styles.date}>{createdAt}</span>

        <div className={styles.actionBar}>
          {!isApproved && (
            <button
              type="button"
              className={styles.btnAccept}
              onClick={() => onApprove?.(id)}
            >
              Принять
            </button>
          )}

          {isPending && (
            <button
              type="button"
              className={styles.btnReject}
              onClick={() => onReject?.(id)}
            >
              Отклонить
            </button>
          )}

          <button
            type="button"
            className={styles.btnEdit}
            onClick={() => onEdit?.(id)}
          >
            Изменить
          </button>

          <button
            type="button"
            className={styles.btnDelete}
            onClick={() => onDelete?.(id)}
          >
            Удалить
          </button>
        </div>
      </footer>
    </article>
  );
};

export default AdminArticleCard;
