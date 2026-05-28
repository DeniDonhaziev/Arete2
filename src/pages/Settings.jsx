import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "../scss/pages/settings.module.scss";
import Footer from "../components/Footer";
import { useTheme } from "../store/useTheme";
import { useApi } from "../hooks/useApi";
import { useAuthStore } from "../store/authStore";
import Header from "../components/Header";
import CreatePostForm from "../components/CreatePostForm";
import {
  getRoleColor,
  getRoleLabel,
  isAdmin,
  sortRolesByPriority,
} from "../utils/roles";

const Settings = () => {
  const { theme } = useTheme();
  const { apiCall } = useApi();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setToken = useAuthStore((s) => s.setToken);

  const fromRegistration = Boolean(location.state?.fromRegistration);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [initialUser, setInitialUser] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setInitialUser({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      });
    }
  }, [user]);

  const getInitials = (fn = "", ln = "") => {
    const cleanFirstName = String(fn).trim();
    const cleanLastName = String(ln).trim();
    return (
      `${cleanLastName.charAt(0)}${cleanFirstName.charAt(0)}`.toUpperCase() || "?"
    );
  };

  const displayName = [firstName, lastName].filter(Boolean).join(" ").trim();

  const isDirty =
    initialUser &&
    (firstName !== initialUser.firstName || lastName !== initialUser.lastName);

  const sortedRoles = sortRolesByPriority(user?.roles || []);

  const saveProfile = async () => {
    if (!user || saving) return;

    try {
      setSaving(true);

      await apiCall(`/users/${user.id}/change`, {
        method: "PUT",
        body: JSON.stringify({ firstName, lastName }),
      });

      setToken(token, {
        ...user,
        firstName,
        lastName,
      });

      setInitialUser({ firstName, lastName });
    } catch (err) {
      console.error("SAVE ERROR", err);
      alert(err.message || "Ошибка запроса");
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      <Header />
      <div
        className={
          theme === "black"
            ? styles.main
            : `${styles.main} ${styles.mainColor}`
        }
      >
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <Link to="/main" className={styles.back}>
              <img
                src={theme === "black" ? "/img/back.svg" : "/img/backBleack.svg"}
                alt="Назад"
              />
            </Link>
            <h1 className={styles.pageTitle}>Мой профиль</h1>
          </div>

          {fromRegistration && (
            <div className={styles.welcomeBanner} role="status">
              <p className={styles.welcomeTitle}>Добро пожаловать в Arête!</p>
              <p className={styles.welcomeText}>
                Аккаунт создан. Вот ваш профиль — данные можно изменить ниже.
              </p>
            </div>
          )}

          <div className={styles.profileCard}>
            <div className={styles.avatar}>
              <span className={styles.avatarInitials}>
                {getInitials(firstName, lastName)}
              </span>
              <img
                className={styles.editAvatar}
                src="/img/edit-avatar.svg"
                alt=""
                aria-hidden="true"
              />
            </div>

            <div className={styles.profileInfo}>
              <h2 className={styles.profileName}>
                {displayName || "Пользователь"}
              </h2>
              {user.email && (
                <p className={styles.profileEmail}>{user.email}</p>
              )}
              {sortedRoles.length > 0 && (
                <p className={styles.profileRole}>
                  {getRoleLabel(sortedRoles[0])}
                </p>
              )}
            </div>
          </div>

          <div className={styles.content}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Основная информация</h2>

              <label className={styles.fieldLabel}>
                Имя
                <input
                  className={styles.input}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Имя"
                  autoComplete="given-name"
                />
              </label>

              <label className={styles.fieldLabel}>
                Фамилия
                <input
                  className={styles.input}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Фамилия"
                  autoComplete="family-name"
                />
              </label>

              <label className={styles.fieldLabel}>
                Email
                <input
                  className={`${styles.input} ${styles.inputReadonly}`}
                  value={user.email || ""}
                  readOnly
                  disabled
                  aria-readonly="true"
                />
              </label>

              <div className={styles.rolesBlock}>
                <p className={styles.rolesTitle}>Мои роли</p>
                <div className={styles.rolesList}>
                  {sortedRoles.map((role) => {
                    const roleColor = getRoleColor(role);
                    return (
                      <span
                        key={role.id}
                        className={styles.roleChip}
                        style={
                          roleColor
                            ? {
                                backgroundColor: roleColor.background,
                                borderColor: roleColor.border,
                                color: roleColor.text,
                              }
                            : undefined
                        }
                      >
                        {getRoleLabel(role)}
                      </span>
                    );
                  })}
                  {sortedRoles.length === 0 && (
                    <span className={styles.roleEmpty}>Роли не назначены</span>
                  )}
                </div>
              </div>
            </section>

            {isDirty && (
              <button
                type="button"
                className={styles.saveBtn}
                onClick={saveProfile}
                disabled={saving}
              >
                {saving ? "Сохранение..." : "Сохранить изменения"}
              </button>
            )}

            {!isAdmin(user) && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Отправить стих в газету</h2>
                <p className={styles.sectionHint}>
                  Стих появится в разделе «Газета» после одобрения администратором.
                </p>
                <CreatePostForm />
              </section>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Settings;
