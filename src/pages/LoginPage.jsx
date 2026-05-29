import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../store/useTheme";
import { completeAuth } from "../store/authStore";
import { loginUser } from "../services/authService";
import { validateLoginForm } from "../utils/validation";
import AuthModeNotice from "../components/AuthModeNotice";
import styles from "../scss/pages/loginPage.module.scss";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { theme } = useTheme();
  const navigate = useNavigate();
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
      const { token, user } = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      completeAuth(token, user);
      navigate("/main", { replace: true });
    } catch (err) {
      setError(err.message || "Ошибка входа");
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
      <div className={styles.logo}>
        <NavLink to="/">
          <img
            src={theme === "black" ? "/img/logo.svg" : "/img/logo-bleack.svg"}
            alt="logo"
            className={styles.logo}
          />
          <img
            src={
              theme === "black"
                ? "/img/logo-text.svg"
                : "/img/logo-text-bleack.svg"
            }
            alt="logo-text"
            className={styles.logoText}
          />
        </NavLink>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          className={styles.input}
          required
          autoComplete="email"
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
          {isLoading ? "Вход..." : "Войти"}
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      <AuthModeNotice />

      <NavLink to="/registration" className={styles.registerLink}>
        Зарегистрироваться
      </NavLink>
    </div>
  );
};

export default LoginPage;
