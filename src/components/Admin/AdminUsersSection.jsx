import { useEffect, useState, useCallback } from "react";
import { useApi } from "../../hooks/useApi";
import { useTheme } from "../../store/useTheme";
import styles from "../../scss/components/Admin/adminSection.module.scss";
import { ROLE_OPTIONS } from "../../constants/roles";
import { getRoleLabel, sortRolesByPriority } from "../../utils/roles";
import { syncAllLocalUsersToServer } from "../../services/syncUserToServer";

const AdminUsersSection = () => {
  const { apiCall } = useApi();
  const { theme } = useTheme();

  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState({});
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setError("");
      const data = await apiCall("/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Не удалось загрузить пользователей");
    }
  }, [apiCall]);

  useEffect(() => {
    const init = async () => {
      await syncAllLocalUsersToServer();
      await fetchUsers();
    };
    init();
    const onRefresh = () => fetchUsers();
    window.addEventListener("focus", onRefresh);
    const intervalId = window.setInterval(onRefresh, 15000);
    return () => {
      window.removeEventListener("focus", onRefresh);
      window.clearInterval(intervalId);
    };
  }, [fetchUsers]);

  const addRole = async (userId) => {
    const roleId = selectedRole[userId];
    if (!roleId) return;

    try {
      setError("");
      await apiCall(`/admin/users/${userId}/add-role?roleId=${roleId}`, {
        method: "POST",
      });

      setSelectedRole((p) => ({ ...p, [userId]: "" }));
      fetchUsers();
    } catch (err) {
      setError(err.message || "Не удалось добавить роль");
    }
  };

  const removeRole = async (userId, roleId) => {
    try {
      setError("");
      await apiCall(`/admin/users/${userId}/remove-role?roleId=${roleId}`, {
        method: "POST",
      });

      fetchUsers();
    } catch (err) {
      setError(err.message || "Не удалось снять роль");
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Удалить пользователя?")) return;

    try {
      setError("");
      await apiCall(`/admin/users/${userId}/del`, {
        method: "DELETE",
      });

      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      setError(err.message || "Не удалось удалить пользователя");
    }
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Пользователи</h2>
      <p className={styles.subtitle}>
        Все зарегистрированные аккаунты клуба ({users.length})
      </p>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.list}>
        {users.length === 0 && (
          <p className={styles.empty}>
            Пока нет пользователей. После регистрации на сайте они появятся здесь.
          </p>
        )}

        {users.map((user) => {
          const userRoles = sortRolesByPriority(user.roles || []);

          return (
            <div
              key={user.id}
              className={`${styles.card} ${
                theme !== "black" ? styles.cardLight : ""
              }`}
            >
              <div className={styles.info}>
                <strong>
                  {user.firstName} {user.lastName}
                </strong>

                <span className={styles.subtitle}>{user.email}</span>

                <div className={styles.roles}>
                  {userRoles.map((r) => (
                    <span key={r.id} className={styles.roleChip}>
                      {getRoleLabel(r)}
                      <button
                        type="button"
                        className={styles.roleRemove}
                        onClick={() => removeRole(user.id, r.id)}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.actions}>
                <select
                  className={styles.input}
                  value={selectedRole[user.id] || ""}
                  onChange={(e) =>
                    setSelectedRole({
                      ...selectedRole,
                      [user.id]: e.target.value,
                    })
                  }
                >
                  <option value="">Добавить роль</option>
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className={styles.btn}
                  onClick={() => addRole(user.id)}
                >
                  Добавить
                </button>

                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnDanger}`}
                  onClick={() => deleteUser(user.id)}
                >
                  Удалить
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AdminUsersSection;
