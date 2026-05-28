import { useEffect, useState, useCallback, useRef } from "react";
import styles from "../../scss/components/admin/adminSection.module.scss";
import { useTheme } from "../../store/useTheme";
import { useApi } from "../../hooks/useApi";
import {
  formatDateTimeRu,
  isValidDateInput,
  toDatetimeLocalValue,
  toIsoDate,
} from "../../utils/date";
import { loadStoredEvents } from "../../services/localEventsStorage";
import { notifyEventsUpdated } from "../../utils/eventsSync";

const AdminEventsSection = () => {
  const { apiCall } = useApi();
  const { theme } = useTheme();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(true);

  const [events, setEvents] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    plannedAt: "",
  });

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    plannedAt: "",
  });
  const editTitleRef = useRef(null);

  const fetchEvents = useCallback(async () => {
    try {
      setError("");
      const data = await apiCall("/events");
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Не удалось загрузить мероприятия");
    }
  }, [apiCall]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    const migrateLocalEventsToServer = async () => {
      const local = loadStoredEvents();
      if (!local.length) return;

      try {
        const remote = await apiCall("/events");
        if (Array.isArray(remote) && remote.length > 0) return;

        for (const event of local) {
          await apiCall("/events", {
            method: "POST",
            body: JSON.stringify({
              title: event.title,
              description: event.description,
              plannedAt: event.plannedAt,
            }),
          });
        }
        await fetchEvents();
        notifyEventsUpdated();
      } catch {
        // сервер ещё не запущен — миграция при следующем заходе
      }
    };

    migrateLocalEventsToServer();
  }, [apiCall, fetchEvents]);

  const createEvent = async (e) => {
    e.preventDefault();
    if (!createForm.title?.trim()) {
      setError("Укажите название мероприятия");
      return;
    }
    if (!createForm.plannedAt || !isValidDateInput(createForm.plannedAt)) {
      setError("Укажите корректную дату и время");
      return;
    }

    try {
      setError("");
      await apiCall("/events", {
        method: "POST",
        body: JSON.stringify({
          title: createForm.title.trim(),
          description: createForm.description.trim(),
          plannedAt: toIsoDate(createForm.plannedAt),
        }),
      });

      setCreateForm({ title: "", description: "", plannedAt: "" });
      await fetchEvents();
      notifyEventsUpdated();
      setError("");
      setSuccess(
        "Мероприятие создано — оно видно пользователям на главной и в разделе «Мероприятия»"
      );
    } catch (err) {
      setError(err.message || "Не удалось создать мероприятие");
    }
  };

  const startEdit = (event) => {
    setEditingId(event.id);
    setEditForm({
      title: event.title,
      description: event.description || "",
      plannedAt: toDatetimeLocalValue(event.plannedAt),
    });
  };

  useEffect(() => {
    if (editingId && editTitleRef.current) {
      editTitleRef.current.focus();
    }
  }, [editingId]);

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: "", description: "", plannedAt: "" });
  };

  const saveEdit = async (id) => {
    if (!editForm.plannedAt || !isValidDateInput(editForm.plannedAt)) {
      setError("Укажите корректную дату и время");
      return;
    }

    try {
      setError("");
      await apiCall(`/events/${id}/change`, {
        method: "PUT",
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          plannedAt: toIsoDate(editForm.plannedAt),
        }),
      });

      cancelEdit();
      fetchEvents();
    } catch (err) {
      setError(err.message || "Не удалось сохранить");
    }
  };

  const handleEditKeyDown = (e, id) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      saveEdit(id);
    }
    if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Удалить мероприятие?")) return;

    try {
      setError("");
      await apiCall(`/events/${id}/del`, { method: "DELETE" });
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(err.message || "Не удалось удалить");
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionTop}>
        <div>
          <h2 className={styles.title}>Мероприятия</h2>
          <p className={styles.sectionDesc}>
            Созданные мероприятия появятся у всех пользователей в разделе «Мероприятия»
            на сайте.
          </p>
        </div>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "Скрыть форму" : "+ Добавить мероприятие"}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}

      {showForm && (
        <form
          className={`${styles.createForm} ${styles.createFormHighlight} ${
            theme !== "black" ? styles.cardLight : ""
          }`}
          onSubmit={createEvent}
        >
          <h3 className={styles.formHeading}>+ Новое мероприятие</h3>
          <input
            className={styles.input}
            placeholder="Название мероприятия *"
            value={createForm.title}
            onChange={(e) =>
              setCreateForm({ ...createForm, title: e.target.value })
            }
          />
          <textarea
            className={styles.textarea}
            placeholder="Описание"
            rows={4}
            value={createForm.description}
            onChange={(e) =>
              setCreateForm({ ...createForm, description: e.target.value })
            }
          />
          <label className={styles.fieldLabel}>
            Дата и время *
            <input
              className={styles.input}
              type="datetime-local"
              value={createForm.plannedAt}
              onChange={(e) =>
                setCreateForm({ ...createForm, plannedAt: e.target.value })
              }
            />
          </label>
          <button type="submit" className={styles.primaryBtn}>
            Создать мероприятие
          </button>
        </form>
      )}

      <div className={styles.list}>
        {events.length === 0 && (
          <p className={styles.empty}>
            Пока нет мероприятий. Нажмите «+ Добавить мероприятие» и заполните форму
            выше.
          </p>
        )}
        {events.map((event) => {
          const isEdit = editingId === event.id;
          const isEditChanged =
            editForm.title !== event.title ||
            editForm.description !== (event.description || "") ||
            editForm.plannedAt !== toDatetimeLocalValue(event.plannedAt);
          const canSave = Boolean(
            editForm.title && editForm.plannedAt && isEditChanged
          );

          return (
            <div
              key={event.id}
              className={`${styles.card} ${
                theme !== "black" ? styles.cardLight : ""
              }`}
            >
              <div className={styles.info}>
                {isEdit ? (
                  <>
                    <input
                      ref={editTitleRef}
                      className={styles.input}
                      value={editForm.title}
                      onKeyDown={(e) => handleEditKeyDown(e, event.id)}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                    />
                    <textarea
                      className={styles.textarea}
                      rows={6}
                      value={editForm.description}
                      onKeyDown={(e) => handleEditKeyDown(e, event.id)}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                    />
                    <input
                      className={styles.input}
                      type="datetime-local"
                      value={editForm.plannedAt}
                      onKeyDown={(e) => handleEditKeyDown(e, event.id)}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          plannedAt: e.target.value,
                        })
                      }
                    />
                  </>
                ) : (
                  <>
                    <strong>{event.title}</strong>
                    <span className={styles.subtitle}>
                      {formatDateTimeRu(event.plannedAt, "Дата не указана")}
                    </span>
                    {event.description && (
                      <span className={styles.subtitle}>{event.description}</span>
                    )}
                  </>
                )}
              </div>

              <div className={styles.actions}>
                {isEdit ? (
                  <>
                    <button
                      type="button"
                      className={styles.btn}
                      disabled={!canSave}
                      onClick={() => saveEdit(event.id)}
                    >
                      Сохранить
                    </button>
                    <button
                      type="button"
                      className={styles.btn}
                      onClick={cancelEdit}
                    >
                      Отмена
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className={styles.btn}
                      onClick={() => startEdit(event)}
                    >
                      Редактировать
                    </button>
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.btnDanger}`}
                      onClick={() => deleteEvent(event.id)}
                    >
                      Удалить
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AdminEventsSection;
