import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminPostsSection from "../components/Admin/AdminPostsSection";
import AdminEventsSection from "../components/Admin/AdminEventsSection";
import AdminUsersSection from "../components/Admin/AdminUsersSection";
import { useAuthStore } from "../store/authStore";
import { logoutSession } from "../services/authSession";
import { useTheme } from "../store/useTheme";
import styles from "../scss/components/Admin/adminPanel.module.scss";

const TABS = [
  {
    id: "posts",
    label: "Модерация",
    description: "Одобрение стихов для газеты",
  },
  {
    id: "events",
    label: "Мероприятия",
    description: "Добавить и редактировать мероприятия",
  },
  {
    id: "users",
    label: "Пользователи",
    description: "Роли и удаление аккаунтов",
  },
];

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const { theme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutSession();
    navigate("/admin/login");
  };

  const activeTabMeta = TABS.find((t) => t.id === activeTab) ?? TABS[0];

  return (
    <div className={theme === "black" ? styles.page : `${styles.page} ${styles.pageLight}`}>
      <header className={styles.adminTopBar}>
        <div className={styles.adminTopBarInner}>
          <div>
            <span className={styles.adminTopLabel}>Arete · Админ-панель</span>
            <p className={styles.adminTopUser}>
              {user?.firstName} {user?.lastName}
              {user?.email ? ` · ${user.email}` : ""}
            </p>
          </div>
          <div className={styles.adminTopActions}>
            <button
              type="button"
              className={styles.adminTopLink}
              onClick={() => navigate("/main")}
            >
              На сайт
            </button>
            <button
              type="button"
              className={styles.adminTopLogout}
              onClick={handleLogout}
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div className={styles.container}>
        <div className={styles.layout}>
          <nav className={styles.mainNav} aria-label="Разделы админ-панели">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={
                  activeTab === tab.id ? styles.navBtnActive : styles.navBtn
                }
                onClick={() => setActiveTab(tab.id)}
              >
                <span className={styles.navBtnLabel}>{tab.label}</span>
                <span className={styles.navBtnHint}>{tab.description}</span>
              </button>
            ))}
          </nav>

          <p className={styles.sectionHelp}>
            Сейчас открыто: <strong>{activeTabMeta.label}</strong> —{" "}
            {activeTabMeta.description}
          </p>

          {activeTab === "posts" && <AdminPostsSection />}
          {activeTab === "events" && <AdminEventsSection />}
          {activeTab === "users" && <AdminUsersSection />}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
