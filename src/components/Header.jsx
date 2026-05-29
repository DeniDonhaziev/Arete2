import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import styles from "../scss/components/header.module.scss";
import BurgerMenu from "./BurgerMenu";
import { useTheme } from "../store/useTheme";
import { useAuthStore } from "../store/authStore";
import { logoutSession } from "../services/authSession";
import BrandTitle from "./BrandTitle";

const NAV_ITEMS = [
  { to: "/main", label: "Главная", icon: "⌂", end: true, guestTo: "/" },
  { to: "/happenings", label: "Мероприятия", icon: "◈" },
  { to: "/newspaper", label: "Газета", icon: "✦" },
  { to: "/rating", label: "Рейтинг", icon: "★" },
  { to: "/settings", label: "Настройки", icon: "○", authOnly: true },
];

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    await logoutSession();
    navigate("/login");
  };

  const menuClass =
    theme === "black"
      ? styles.desktopMenu
      : `${styles.desktopMenu} ${styles.desktopMenuColor}`;

  return (
    <>
      {menuOpen && <BurgerMenu closeMenu={closeMenu} />}

      <header className={styles.header}>
        <NavLink
          to={isAuthenticated ? "/main" : "/"}
          className={styles.headerIcon}
        >
          <img
            src={theme === "black" ? "/img/logo.svg" : "/img/logo-bleack.svg"}
            alt=""
            aria-hidden="true"
          />
          <BrandTitle size="header" />
        </NavLink>

        <img
          className={styles.burgerMenu}
          src={
            theme === "black"
              ? "/img/burger-menu.svg"
              : "/img/burger-menu-bleack.jpg"
          }
          alt="menu"
          onClick={openMenu}
        />

        <nav className={menuClass} aria-label="Основная навигация">
          {NAV_ITEMS.map(({ to, label, icon, end, authOnly, guestTo }) => {
            if (authOnly && !isAuthenticated) return null;

            const linkTo =
              !isAuthenticated && guestTo ? guestTo : to;

            return (
              <NavLink
                key={to}
                to={linkTo}
                end={end && isAuthenticated}
                className={({ isActive }) =>
                  [styles.navLink, isActive ? styles.active : ""]
                    .filter(Boolean)
                    .join(" ")
                }
              >
                <span className={styles.navIcon} aria-hidden="true">
                  {icon}
                </span>
                <span className={styles.navLabel}>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className={styles.actions}>
          <div
            className={
              theme === "black"
                ? `${styles.divChick} ${styles.divcolor}`
                : styles.divChick
            }
            onClick={toggleTheme}
          >
            <img
              src={theme === "black" ? "/img/logo-bleack.svg" : "/img/logo.svg"}
              alt="theme"
            />
          </div>

          {isAuthenticated ? (
            <>
              <span className={styles.userName}>
                {[user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
                  "Профиль"}
              </span>
              <span className={styles.logoutLink} onClick={handleLogout}>
                ВЫЙТИ
              </span>
            </>
          ) : (
            <Link
              to="/login"
              className={
                theme === "black"
                  ? styles.loginButton
                  : `${styles.loginButton} ${styles.loginButtonColor}`
              }
            >
              ВОЙТИ
            </Link>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
