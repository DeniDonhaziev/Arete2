import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { logoutSession } from "../services/authSession";
import styles from "../scss/components/burgerMenu.module.scss";
import { useTheme } from "../store/useTheme";

const BurgerMenu = ({ closeMenu }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const getInitials = (firstName = "", lastName = "", username = "") => {
    const ln = String(lastName).trim();
    const fn = String(firstName).trim();

    if (ln || fn) {
      return `${ln.charAt(0)}${fn.charAt(0)}`.toUpperCase();
    }

    return String(username).trim().charAt(0).toUpperCase() || "?";
  };

  const handleLogout = async () => {
    await logoutSession();
    closeMenu();
    navigate("/login");
  };

  return (
    <aside className={theme === 'black' ? styles.burgerMenu : `${styles.burgerMenu} ${styles.burgerColor}`} role="dialog" aria-modal="true">
      <button
        className={styles.closeButton}
        onClick={closeMenu}
        aria-label="Закрыть меню"
      >
        <img src={theme === 'black' ? "/img/closeMenu.svg" : "/img/closeMenuBleack.svg"} alt="closeMenu" />
      </button>

      <div className={theme === 'black' ? styles.logoColors : `${styles.logoColors} ${styles.logoBleack}`}
        onClick={() => toggleTheme()}>
        <img src={theme === 'black' ? "/img/logo-bleack.svg" : "/img/logo.svg"} alt="logo" />
      </div>

      {/* ✅ ДИНАМИЧЕСКИЙ ПРОФИЛЬ */}
      {isAuthenticated ? (
        <div className={styles.profile}>
          <div className={styles.avatar}>
            <span className={styles.avatarInitials}>
              {getInitials(user?.firstName, user?.lastName, user?.username)}
            </span>
          </div>
          <div className={styles.name}>
            {[user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
              user?.username ||
              "Пользователь"}
          </div>
        </div>
      ) : (
        <div className={styles.profile}>
          <div className={styles.name}>Гость</div>
        </div>
      )}

      <nav className={styles.menu}>
        {/* ✅ ОСНОВНЫЕ ССЫЛКИ — всегда видны */}
        <NavLink
          to={isAuthenticated ? "/main" : "/"}
          className={({ isActive }) =>
            isActive ? `${styles.menuItem} ${styles.active}` : styles.menuItem
          }
          onClick={closeMenu}
        >
          Главная
        </NavLink>

        <NavLink
          to="/newspaper"
          className={({ isActive }) =>
            isActive ? `${styles.menuItem} ${styles.active}` : styles.menuItem
          }
          onClick={closeMenu}
        >
          Газета
        </NavLink>

        <NavLink
          to="/happenings"
          className={({ isActive }) =>
            isActive ? `${styles.menuItem} ${styles.active}` : styles.menuItem
          }
          onClick={closeMenu}
        >
          Мероприятия
        </NavLink>

        <NavLink
          to="/rating"
          className={({ isActive }) =>
            isActive ? `${styles.menuItem} ${styles.active}` : styles.menuItem
          }
          onClick={closeMenu}
        >
          Рейтинг
        </NavLink>

        {/* ✅ КОНДИЦИОННАЯ НАВИГАЦИЯ */}
        {isAuthenticated ? (
          <>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                isActive ? `${styles.menuItem} ${styles.active}` : styles.menuItem
              }
              onClick={closeMenu}
            >
              Настройки
            </NavLink>

            <button
              className={`${styles.menuItem} ${styles.logout}`}
              onClick={handleLogout}
            >
              Выйти
            </button>
          </>
        ) : (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                isActive ? `${styles.menuItem} ${styles.active}` : styles.menuItem
              }
              onClick={closeMenu}
            >
              Войти
            </NavLink>

            <NavLink
              to="/registration"
              className={({ isActive }) =>
                isActive ? `${styles.menuItem} ${styles.active}` : styles.menuItem
              }
              onClick={closeMenu}
            >
              Регистрация
            </NavLink>
          </>
        )}

      </nav>
    </aside>
  );
};

export default BurgerMenu;
