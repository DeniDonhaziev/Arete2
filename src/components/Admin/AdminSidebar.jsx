import styles from "../../scss/components/admin/adminSidebar.module.scss";

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.title}>Админка</h2>

      <button
        className={activeTab === "posts" ? styles.active : ""}
        onClick={() => setActiveTab("posts")}
      >
        Стихи
      </button>

      <button
        className={activeTab === "events" ? styles.active : ""}
        onClick={() => setActiveTab("events")}
      >
        Мероприятия
      </button>

      <button
        className={activeTab === "users" ? styles.active : ""}
        onClick={() => setActiveTab("users")}
      >
        Пользователи
      </button>
    </aside>
  );
};

export default AdminSidebar;
