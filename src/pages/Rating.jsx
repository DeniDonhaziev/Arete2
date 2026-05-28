import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import styles from "../scss/pages/rating.module.scss";
import Footer from "../components/Footer";
import Search from "../components/Search";
import { useTheme } from "../store/useTheme";
import { useApi } from "../hooks/useApi";
import { getHighestRoleLabel, sortRolesByPriority } from "../utils/roles";

const Rating = () => {
  const { theme } = useTheme();
  const { apiCall } = useApi();

  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiCall("/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Ошибка загрузки рейтинга");
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const rankedUsers = useMemo(() => {
    const sorted = [...users].sort((a, b) => {
      const aPriority = sortRolesByPriority(a.roles || [])[0]?.id || 0;
      const bPriority = sortRolesByPriority(b.roles || [])[0]?.id || 0;

      if (aPriority !== bPriority) return bPriority - aPriority;

      const aName = `${a.lastName || ""} ${a.firstName || ""}`.trim().toLowerCase();
      const bName = `${b.lastName || ""} ${b.firstName || ""}`.trim().toLowerCase();
      return aName.localeCompare(bName, "ru");
    });

    const ranked = sorted.map((user, index) => ({
      ...user,
      position: index + 1,
      topRole: getHighestRoleLabel(user.roles || []),
    }));

    return ranked.filter((user) => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;

      return (
        `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase().includes(query) ||
        (user.email || "").toLowerCase().includes(query) ||
        (getHighestRoleLabel(user.roles || []) || "").toLowerCase().includes(query)
      );
    });
  }, [searchQuery, users]);

  const getInitials = (firstName = "", lastName = "") =>
    `${String(firstName).trim().charAt(0)}${String(lastName).trim().charAt(0)}`.toUpperCase() || "?";

  const getCardClassName = (position) => {
    const baseClass = styles.card; 
    
    switch(position) {
      case 1:
        return `${baseClass} ${styles.firstPosition}`;
      case 2:
        return `${baseClass} ${styles.twoPosition}`;
      case 3:
        return `${baseClass} ${styles.threePosition}`;
      default:
        return baseClass;
    }
  };

  return (
    <>
      <Header />
      <div className={theme === 'black' ? styles.container : `${styles.container} ${styles.containerColor}`}>
        <h1 className={theme === 'black' ? styles.title : `${styles.title} ${styles.titleColor}`}>
          Рейтинг
        </h1>

        <Search value={searchQuery} onChange={setSearchQuery} />

        {loading && <p style={{ textAlign: "center" }}>Загрузка...</p>}
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        {!loading && !error && rankedUsers.length === 0 && (
          <p style={{ textAlign: "center" }}>Ничего не найдено</p>
        )}

        <div className={styles.cards}>
          {rankedUsers.map((item) => (
            <article className={getCardClassName(item.position)} key={item.id}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                {item.avatar ? (
                  <img src={item.avatar} alt="" />
                ) : (
                  <div className={styles.avatarCircle}>
                    {getInitials(item.firstName, item.lastName)}
                  </div>
                )}
                <div>
                  <p>{item.firstName}</p>
                  <p>{item.lastName}</p>
                </div>
              </div>
              <span className={styles.cardPosition}>{item.position}</span>
            </article>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Rating;
