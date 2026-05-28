import styles from "../../scss/components/Admin/adminHeader.module.scss";
import { useTheme } from "../../store/useTheme";

const TABS = [
  { id: "posts", label: "Модерация", hint: "Одобрение стихов для газеты" },
  { id: "events", label: "Мероприятия", hint: "Создание и редактирование" },
  { id: "users", label: "Пользователи", hint: "Роли и удаление" },
];

const AdminHeader = ({ activeTab, setActiveTab }) => {
  const { theme } = useTheme();

  return (
    <nav
      className={`${styles.header} ${
        theme !== "black" ? styles.headerLight : ""
      }`}
    >
      <ul className={styles.tabs}>
        {TABS.map((tab) => (
          <li
            key={tab.id}
            className={`${styles.tab} ${
              activeTab === tab.id ? styles.active : ""
            }`}
          >
            <button
              type="button"
              className={styles.tabButton}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.tabLabel}>{tab.label}</span>
              <span className={styles.tabHint}>{tab.hint}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default AdminHeader;
