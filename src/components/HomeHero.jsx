import { NavLink } from "react-router-dom";
import BrandTitle from "./BrandTitle";
import styles from "../scss/components/homeHero.module.scss";

const EXPLORE_LINKS = [
  {
    to: "/newspaper",
    glyph: "✦",
    title: "Газета",
    desc: "стихи и публикации клуба",
    tone: "gold",
  },
  {
    to: "/happenings",
    glyph: "◈",
    title: "Мероприятия",
    desc: "встречи, speckup и события",
    tone: "violet",
  },
  {
    to: "/rating",
    glyph: "★",
    title: "Сообщество",
    desc: "рейтинг и роли участников",
    tone: "gold",
  },
  {
    to: "/settings",
    glyph: "○",
    title: "Профиль",
    desc: "настройки и ваш аккаунт",
    tone: "neutral",
  },
];

const HomeHero = ({ user, displayName, initials, topRole, roleLabel }) => (
  <section className={styles.hero} aria-label="Arête — главная">
    <div className={styles.heroGlow} aria-hidden="true" />
    <div className={styles.heroRing} aria-hidden="true" />

    <div className={styles.heroInner}>
      <div className={styles.heroIntro}>
        <span className={styles.heroBadge}>Книжный клуб · космос идей</span>
        <BrandTitle size="hero" as="h1" className={styles.brandHero} />
        <p className={styles.heroTagline}>Вселенная книг, искусства и роста</p>

        <NavLink to="/settings" className={styles.profileChip}>
          <span className={styles.profileAvatar}>{initials}</span>
          <span className={styles.profileMeta}>
            <span className={styles.profileGreeting}>С возвращением</span>
            <span className={styles.profileName}>{displayName || "Участник"}</span>
            {topRole && <span className={styles.profileRole}>{roleLabel}</span>}
          </span>
          <span className={styles.profileArrow} aria-hidden="true">
            →
          </span>
        </NavLink>
      </div>

      <nav className={styles.exploreGrid} aria-label="Разделы клуба">
        {EXPLORE_LINKS.map((item, index) => (
          <NavLink
            key={item.to + item.title}
            to={item.to}
            className={({ isActive }) =>
              [
                styles.exploreCard,
                styles[`tone_${item.tone}`],
                isActive ? styles.exploreCardActive : "",
              ]
                .filter(Boolean)
                .join(" ")
            }
            style={{ animationDelay: `${index * 0.07}s` }}
          >
            <span className={styles.cardGlyph} aria-hidden="true">
              {item.glyph}
            </span>
            <span className={styles.cardBody}>
              <span className={styles.cardTitle}>{item.title}</span>
              <span className={styles.cardDesc}>{item.desc}</span>
            </span>
            <span className={styles.cardGo} aria-hidden="true">
              ↗
            </span>
          </NavLink>
        ))}
      </nav>
    </div>
  </section>
);

export default HomeHero;
