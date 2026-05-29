import { NavLink, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import styles from "../scss/components/bottomNav.module.scss";

const ITEMS = [
  { to: "/main", label: "Главная", icon: "⌂", end: true },
  { to: "/happenings", label: "События", icon: "◈" },
  { to: "/newspaper", label: "Газета", icon: "✦" },
  { to: "/rating", label: "Рейтинг", icon: "★" },
  { to: "/settings", label: "Профиль", icon: "○" },
];

const HIDDEN_PREFIXES = ["/login", "/registration", "/admin", "/singup"];

const BottomNav = () => {
  const { pathname } = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) return null;
  if (pathname === "/" || HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) {
    return null;
  }

  return (
    <>
      <div className={styles.spacer} aria-hidden="true" />
      <nav className={styles.dock} aria-label="Быстрая навигация">
        {ITEMS.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [styles.item, isActive ? styles.itemActive : ""].filter(Boolean).join(" ")
            }
          >
            <span className={styles.icon} aria-hidden="true">
              {icon}
            </span>
            <span className={styles.label}>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
};

export default BottomNav;
