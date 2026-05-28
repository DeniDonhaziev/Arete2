import { useCallback, useEffect, useMemo, useState } from "react";
import AdminArticleCard from "./AdminArticleCard";
import styles from "../../scss/components/adminPanel.module.scss";
import formStyles from "../../scss/components/admin/adminSection.module.scss";
import { useTheme } from "../../store/useTheme";
import { useApi } from "../../hooks/useApi";
import { useAuthStore } from "../../store/authStore";

import { formatDateRu } from "../../utils/date";

const formatPostDate = (iso) => formatDateRu(iso);

const mapPostToCard = (post) => ({
  id: post.id,
  type: "Стих",
  title: post.title,
  author: post.author
    ? `${post.author.lastName || ""} ${(post.author.firstName || "").charAt(0)}.`.trim()
    : "Автор",
  createdAt: formatPostDate(post.createdAt),
  status: post.status || "approved",
  excerpt: post.description,
});

const AdminPostsSection = () => {
  const { apiCall } = useApi();
  const { theme } = useTheme();
  const adminUser = useAuthStore((state) => state.user);

  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "" });
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    asDraft: false,
  });

  const fetchPosts = useCallback(async () => {
    try {
      setError("");
      const data = await apiCall("/posts");
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Не удалось загрузить публикации");
    }
  }, [apiCall]);

  useEffect(() => {
    fetchPosts();
    const onRefresh = () => fetchPosts();
    window.addEventListener("focus", onRefresh);
    const intervalId = window.setInterval(onRefresh, 15000);
    return () => {
      window.removeEventListener("focus", onRefresh);
      window.clearInterval(intervalId);
    };
  }, [fetchPosts]);

  const pendingCount = useMemo(
    () => posts.filter((p) => (p.status || "approved") === "pending").length,
    [posts]
  );

  const filteredPosts = useMemo(() => {
    if (filter === "approved") {
      return posts.filter((p) => (p.status || "approved") === "approved");
    }
    if (filter === "pending") {
      return posts.filter((p) => (p.status || "approved") === "pending");
    }
    return posts;
  }, [posts, filter]);

  const cards = useMemo(() => filteredPosts.map(mapPostToCard), [filteredPosts]);

  const createPost = async (e) => {
    e.preventDefault();
    if (!createForm.title || !createForm.description) return;

    try {
      setError("");
      await apiCall("/posts", {
        method: "POST",
        body: JSON.stringify({
          title: createForm.title,
          description: createForm.description,
          status: createForm.asDraft ? "pending" : "approved",
          author: adminUser
            ? {
                id: adminUser.id,
                firstName: adminUser.firstName,
                lastName: adminUser.lastName,
              }
            : undefined,
        }),
      });
      setCreateForm({ title: "", description: "", asDraft: false });
      fetchPosts();
      if (createForm.asDraft) setFilter("pending");
    } catch (err) {
      setError(err.message || "Не удалось создать публикацию");
    }
  };

  const approvePost = async (id) => {
    try {
      setError("");
      setSuccess("");
      await apiCall(`/posts/${id}/approve`, { method: "POST" });
      setSuccess("Принято — стих опубликован в газете");
      fetchPosts();
    } catch (err) {
      setError(err.message || "Не удалось принять");
    }
  };

  const rejectPost = async (id) => {
    if (!window.confirm("Отклонить публикацию?")) return;
    try {
      setError("");
      setSuccess("");
      await apiCall(`/posts/${id}/reject`, { method: "POST" });
      setSuccess("Публикация отклонена");
      fetchPosts();
    } catch (err) {
      setError(err.message || "Не удалось отклонить");
    }
  };

  const deletePost = async (id) => {
    if (!window.confirm("Удалить публикацию навсегда?")) return;
    try {
      setError("");
      setSuccess("");
      await apiCall(`/posts/${id}/del`, { method: "DELETE" });
      setSuccess("Публикация удалена");
      fetchPosts();
    } catch (err) {
      setError(err.message || "Не удалось удалить");
    }
  };

  const startEdit = (id) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    setEditingId(id);
    setEditForm({ title: post.title, description: post.description });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      setError("");
      await apiCall(`/posts/${editingId}/change`, {
        method: "PUT",
        body: JSON.stringify(editForm),
      });
      setEditingId(null);
      fetchPosts();
    } catch (err) {
      setError(err.message || "Не удалось сохранить");
    }
  };

  const createTestPending = async () => {
    try {
      setError("");
      await apiCall("/posts", {
        method: "POST",
        body: JSON.stringify({
          title: "Тестовый стих на модерации",
          description:
            "Это пример стиха от участника. Нажмите «Одобрить», чтобы он появился в газете.",
          status: "pending",
          author: {
            id: 2,
            firstName: "Иван",
            lastName: "Иванов",
          },
        }),
      });
      setFilter("pending");
      fetchPosts();
    } catch (err) {
      setError(err.message || "Не удалось создать тест");
    }
  };

  return (
    <section
      className={`${styles.postsRoot} ${
        theme !== "black" ? styles.adminBlogsColor : ""
      }`}
    >
      <div className={styles.adminBlogs}>
        <div className={styles.moderationBanner}>
          <h2 className={styles.moderationTitle}>Модерация газеты</h2>
          <p className={styles.moderationSteps}>
            1. Участник отправляет стих в <strong>Профиль</strong> → «Отправить стих
            в газету».<br />
            2. Здесь нажмите фильтр <strong>«На модерации»</strong>.<br />
            3. Нажмите <strong>«Принять»</strong> — стих появится в газете, или{" "}
            <strong>«Удалить»</strong> — чтобы убрать.
          </p>
          {pendingCount > 0 ? (
            <p className={styles.moderationAlert}>
              Сейчас на модерации: <strong>{pendingCount}</strong>
            </p>
          ) : (
            <p className={styles.moderationHint}>
              Очередь пуста. Зарегистрируйте обычного пользователя и отправьте стих из
              профиля, либо создайте тест:
            </p>
          )}
          {pendingCount === 0 && (
            <button
              type="button"
              className={styles.moderationTestBtn}
              onClick={createTestPending}
            >
              Создать тестовый стих на модерации
            </button>
          )}
        </div>

        {error && <p className={formStyles.error}>{error}</p>}
        {success && <p className={formStyles.success}>{success}</p>}

        <div className={styles.filterBar}>
          <button
            type="button"
            className={`${styles.filterBtn} ${
              filter === "pending" ? styles.filterBtnActive : ""
            }`}
            onClick={() => setFilter("pending")}
          >
            На модерации {pendingCount > 0 ? `(${pendingCount})` : ""}
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${
              filter === "approved" ? styles.filterBtnActive : ""
            }`}
            onClick={() => setFilter("approved")}
          >
            Опубликовано
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${
              filter === "all" ? styles.filterBtnActive : ""
            }`}
            onClick={() => setFilter("all")}
          >
            Все
          </button>
          <span className={styles.filterInfo}>
            Показано {cards.length} из {posts.length}
          </span>
        </div>

        <div className={styles.cardsGrid}>
          {cards.map((article) => (
            <AdminArticleCard
              key={article.id}
              {...article}
              onApprove={approvePost}
              onReject={rejectPost}
              onEdit={startEdit}
              onDelete={deletePost}
            />
          ))}

          {cards.length === 0 && (
            <div className={styles.emptyState}>
              {filter === "pending"
                ? "Нет стихов на модерации. Попросите участника отправить стих из профиля или нажмите кнопку выше."
                : "В этом разделе пока ничего нет."}
            </div>
          )}
        </div>

        {editingId && (
          <div
            className={`${formStyles.createForm} ${
              theme !== "black" ? formStyles.cardLight : ""
            }`}
          >
            <h3 className={formStyles.title}>Редактирование</h3>
            <input
              className={formStyles.input}
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            />
            <textarea
              className={formStyles.textarea}
              rows={8}
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
            />
            <div className={formStyles.actions}>
              <button type="button" className={formStyles.btn} onClick={saveEdit}>
                Сохранить
              </button>
              <button
                type="button"
                className={formStyles.btn}
                onClick={() => setEditingId(null)}
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        <details className={styles.createDetails}>
          <summary className={styles.createSummary}>
            + Создать публикацию от имени админа
          </summary>
          <form
            className={`${formStyles.createForm} ${
              theme !== "black" ? formStyles.cardLight : ""
            }`}
            onSubmit={createPost}
          >
            <input
              className={formStyles.input}
              placeholder="Название"
              value={createForm.title}
              onChange={(e) =>
                setCreateForm({ ...createForm, title: e.target.value })
              }
            />
            <textarea
              className={formStyles.textarea}
              placeholder="Текст"
              rows={5}
              value={createForm.description}
              onChange={(e) =>
                setCreateForm({ ...createForm, description: e.target.value })
              }
            />
            <label className={formStyles.checkboxRow}>
              <input
                type="checkbox"
                checked={createForm.asDraft}
                onChange={(e) =>
                  setCreateForm({ ...createForm, asDraft: e.target.checked })
                }
              />
              Сохранить как черновик (на модерации)
            </label>
            <button type="submit" className={formStyles.btn}>
              {createForm.asDraft ? "В очередь модерации" : "Сразу в газету"}
            </button>
          </form>
        </details>
      </div>
    </section>
  );
};

export default AdminPostsSection;
