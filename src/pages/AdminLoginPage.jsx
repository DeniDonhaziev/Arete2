import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../store/useTheme";
import { completeAuth } from "../store/authStore";
import { loginAdmin } from "../services/authService";
import { ADMIN_EMAIL } from "../config/adminAccount";
import { USE_FIREBASE_AUTH } from "../config/firebaseEnv";
import { validateLoginForm } from "../utils/validation";
import styles from "../scss/pages/adminLoginPage.module.scss";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateLoginForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { token, user } = await loginAdmin({
        email: formData.email.trim(),
        password: formData.password,
      });

      completeAuth(token, user);
      navigate("/admin", { replace: true });
    } catch (err) {
      if (err.status === 403) {
        setError("Доступ только для администратора клуба");
      } else if (err.status === 401) {
        setError("Неверный email или пароль администратора");
      } else {
        setError(err.message || "Ошибка входа");
      }
      setIsLoading(false);
    }
  };

  return (
    <div
      className={
        theme === "black"
          ? styles.container
          : `${styles.container} ${styles.containerColor}`
      }
    >
      <div className={styles.badge}>Админ-панель</div>

      <div className={styles.logo}>
        <img
          src={theme === "black" ? "/img/logo.svg" : "/img/logo-bleack.svg"}
          alt="Arete"
        />
        <h1 className={styles.title}>Вход для администратора</h1>
        <p className={styles.subtitle}>
          Отдельная учётная запись. Обычные пользователи входят через главную
          страницу.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <input
          name="email"
          type="email"
          placeholder="Email администратора"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          className={styles.input}
          required
          autoComplete="username"
        />
        <input
          name="password"
          type="password"
          placeholder="Пароль"
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
          className={styles.input}
          required
          autoComplete="current-password"
        />
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? "Вход..." : "Войти в админ-панель"}
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      <ul className={styles.features}>
        <li>Публикации — создание, редактирование и одобрение</li>
        <li>Мероприятия — создание и редактирование</li>
        <li>Пользователи — роли и удаление</li>
      </ul>

      <p className={styles.hint}>
        {USE_FIREBASE_AUTH ? (
          <>
            Firebase: войдите как <strong>{ADMIN_EMAIL}</strong> (пользователь
            должен быть создан в Firebase Authentication)
          </>
        ) : (
          <>
            Локальный режим: <strong>{ADMIN_EMAIL}</strong>
          </>
        )}
      </p>

      <NavLink to="/main" className={styles.backLink}>
        ← На сайт клуба
      </NavLink>
    </div>
  );
};

export default AdminLoginPage;
