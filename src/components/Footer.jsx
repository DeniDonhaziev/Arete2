import { NavLink } from "react-router-dom";
import styles from "../scss/components/footer.module.scss";
import { useTheme } from "../store/useTheme";
import { useAuthStore } from "../store/authStore";

const Footer = () => {
  const { theme } = useTheme();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isDark = theme === "black";
  const homePath = isAuthenticated ? "/main" : "/";

  return (
    <footer
      className={
        isDark ? styles.footer : `${styles.footer} ${styles.footerColor}`
      }
    >
      <div className={styles.footerInner}>
        <div className={styles.brand}>
          <img
            src={isDark ? "/img/logo.svg" : "/img/logo-bleack.svg"}
            alt="Arete"
            className={styles.logoIcon}
          />
          <img
            src={isDark ? "/img/logo-text.svg" : "/img/logo-text-bleack.svg"}
            alt="Arete Books Club"
            className={styles.logoText}
          />
          <p className={styles.tagline}>
            Космос идей · путь к своей Arête
          </p>
        </div>

        <nav className={styles.footerNav} aria-label="Навигация в подвале">
          <NavLink to={homePath}>Главная</NavLink>
          <NavLink to="/happenings">Мероприятия</NavLink>
          <NavLink to="/newspaper">Газета</NavLink>
          <NavLink to="/rating">Рейтинг</NavLink>
          <NavLink to="/admin/login" className={styles.adminLink}>
            Админ
          </NavLink>
        </nav>

        <p className={styles.copyright}>
          © {new Date().getFullYear()} Arete Books Club
        </p>
      </div>
    </footer>
  );
};

export default Footer;
