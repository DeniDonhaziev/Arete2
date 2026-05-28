import React from "react";
import styles from "../../scss/components/adminPanel.module.scss";
import AdminEventCard from "../Admin/AdminEventCard";

const mockEvents = [
  {
    id: 1,
    type: "Мероприятие",
    title: "Онлайн-встреча по литературе",
    author: "Организатор: Библиотека №12",
    createdAt: "20.06.2025",
    status: "pending",
    excerpt:
      "Обсуждаем современные поэтические формы, делимся любимыми стихами и разбираем тексты участников...",
  },
  {
    id: 2,
    type: "Лекция",
    title: "Вечер поэзии в городском центре",
    author: "Организатор: Дом культуры",
    createdAt: "25.06.2025",
    status: "approved",
    excerpt:
      "Живое чтение стихов, открытый микрофон и обсуждение творчества современных авторов.",
  },
];

const AdminEvents = () => {
  const [filter, setFilter] = React.useState("all");

  const events = mockEvents; // сюда потом подставишь реальные данные

  const filteredEvents = React.useMemo(() => {
    if (filter === "approved") return events.filter((e) => e.status === "approved");
    if (filter === "pending") return events.filter((e) => e.status === "pending");
    return events;
  }, [events, filter]);

  const total = events.length;
  const shown = filteredEvents.length;

  const handleApprove = (id) => {
    console.log("approve event", id);
  };

  const handleReject = (id) => {
    console.log("reject event", id);
  };

  const handleEdit = (id) => {
    console.log("edit event", id);
  };

  const handleDelete = (id) => {
    console.log("delete event", id);
  };

  const handleOpen = (id) => {
    console.log("open event", id);
  };

  return (
    <section className={styles.container}>
      <div className={styles.adminBlogs}>
        <div style={{ padding: "10px" }}>
          <h2>Мероприятия</h2>

          <div className={styles.filterBar}>
            <button
              type="button"
              className={
                styles.filterBtn +
                " " +
                (filter === "all" ? styles.filterBtnActive : "")
              }
              onClick={() => setFilter("all")}
            >
              Все
            </button>
            <button
              type="button"
              className={
                styles.filterBtn +
                " " +
                (filter === "approved" ? styles.filterBtnActive : "")
              }
              onClick={() => setFilter("approved")}
            >
              Подтверждённые
            </button>
            <button
              type="button"
              className={
                styles.filterBtn +
                " " +
                (filter === "pending" ? styles.filterBtnActive : "")
              }
              onClick={() => setFilter("pending")}
            >
              На модерации
            </button>

            <span className={styles.filterInfo}>
              Показано {shown} из {total}
            </span>
          </div>
        </div>

        <div className={styles.cardsGrid}>
          {filteredEvents.map((event) => (
            <AdminEventCard
              key={event.id}
              {...event}
              onApprove={handleApprove}
              onReject={handleReject}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onOpen={handleOpen}
            />
          ))}

          {shown === 0 && (
            <div className={styles.emptyState}>
              По выбранному фильтру мероприятий нет.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminEvents;
