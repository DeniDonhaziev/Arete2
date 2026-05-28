import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../store/useTheme";
import { completeAuth } from "../store/authStore";
import { registerUser } from "../services/authService";
import { redirectToMain } from "../utils/authStorage";
import { validateRegistrationForm } from "../utils/validation";
import styles from "../scss/pages/registerPage.module.scss";

const RegisterPage = ({ isLanding = false }) => {
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateRegistrationForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { token, user } = await registerUser({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      completeAuth(token, user);
      redirectToMain();
    } catch (err) {
      setError(err.message || "Ошибка регистрации");
      setIsLoading(false);
    }
  };

  return (
    <div
      className={
        theme === "black"
          ? `${styles.container} ${isLanding ? styles.containerLanding : ""}`
          : `${styles.container} ${styles.containerColor} ${isLanding ? styles.containerLanding : ""}`
      }
    >
      {!isLanding && (
        <header className={styles.header}>
          <NavLink to="/">
            <img
              src={theme === "black" ? "/img/back.svg" : "/img/backBleack.svg"}
              alt="Назад"
              className={styles.backIcon}
            />
          </NavLink>
        </header>
      )}

      <div className={styles.logo}>
        {isLanding ? (
          <img
            src={theme === "black" ? "/img/logo.svg" : "/img/logo-bleack.svg"}
            alt="Arete"
          />
        ) : (
          <NavLink to="/">
            <img
              src={theme === "black" ? "/img/logo.svg" : "/img/logo-bleack.svg"}
              alt="Arete"
            />
          </NavLink>
        )}
        <h1 className={styles.logoText}>Arête</h1>
        {isLanding && (
          <p className={styles.landingSubtitle}>
            Книжный клуб · создайте аккаунт, чтобы начать
          </p>
        )}
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <input
          name="firstName"
          placeholder="Имя"
          value={formData.firstName}
          onChange={handleChange}
          className={styles.input}
          required
          disabled={isLoading}
          autoComplete="given-name"
        />
        <input
          name="lastName"
          placeholder="Фамилия"
          value={formData.lastName}
          onChange={handleChange}
          className={styles.input}
          required
          disabled={isLoading}
          autoComplete="family-name"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className={styles.input}
          required
          disabled={isLoading}
          autoComplete="email"
        />
        <input
          name="password"
          type="password"
          placeholder="Пароль (минимум 8 символов)"
          value={formData.password}
          onChange={handleChange}
          className={styles.input}
          required
          minLength={8}
          disabled={isLoading}
          autoComplete="new-password"
        />
        <input
          name="confirmPassword"
          type="password"
          placeholder="Подтвердите пароль"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={styles.input}
          required
          disabled={isLoading}
          autoComplete="new-password"
        />

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? "Переход на главную..." : "Зарегистрироваться"}
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      <NavLink to="/login" className={styles.loginLink}>
        Уже есть аккаунт? Войти
      </NavLink>
    </div>
  );
};

export default RegisterPage;
