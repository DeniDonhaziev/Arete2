import React from "react";
import styles from "../../scss/components/adminPanel.module.scss";
import AdminArticleCard from "../Admin/AdminArticleCard";

const mockArticles = [
  {
    id: 1,
    type: "Статья",
    title: "Как читать больше и не выгорать",
    author: "Иванов И.",
    createdAt: "10.06.2025",
    status: "pending",
    excerpt:
      "В современном мире информационный поток кажется бесконечным. Как успевать читать и при этом сохранять удовольствие от процесса?..",
  },
  {
    id: 2,
    type: "Стих",
    title: "В бескрайних страницах Вселенной",
    author: "Иванов И.",
    createdAt: "09.06.2025",
    status: "approved",
    excerpt: "Сквозь звёздный туман и тишину я открываю книгу, как окно...",
  },
];

const AdminBlogs = () => {
  const [filter, setFilter] = React.useState("all");

  const articles = mockArticles; 

  const filteredArticles = React.useMemo(() => {
    if (filter === "approved") return articles.filter((a) => a.status === "approved");
    if (filter === "pending") return articles.filter((a) => a.status === "pending");
    return articles;
  }, [articles, filter]);

  const total = articles.length;
  const shown = filteredArticles.length;

  const handleApprove = (id) => {
    console.log("approve", id);
  };

  const handleReject = (id) => {
    console.log("reject", id);
  };

  const handleEdit = (id) => {
    console.log("edit", id);
  };

  const handleDelete = (id) => {
    console.log("delete", id);
  };

  const handleOpen = (id) => {
    console.log("open", id);
  };

  return (
    <section className={styles.container}>
      <div className={styles.adminBlogs}>
        <div style={{padding:'10px'}}>
          <h2>Статьи</h2>

          <div className={styles.filterBar}>
            <button
              type="button"
              className={
                styles.filterBtn + " " + (filter === "all" ? styles.filterBtnActive : "")
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
          {filteredArticles.map((article) => (
            <AdminArticleCard
              key={article.id}
              {...article}
              onApprove={handleApprove}
              onReject={handleReject}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onOpen={handleOpen}
            />
          ))}

          {shown === 0 && (
            <div className={styles.emptyState}>
              По выбранному фильтру статей нет.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminBlogs;
