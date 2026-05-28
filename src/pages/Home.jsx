import styles from "../scss/pages/home.module.scss";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SlayderSessions from "../components/SlayderSessions";
import PoemCard from "../components/PoemCard";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { readPersistedSession } from "../utils/authStorage";
import { getRoleLabel, sortRolesByPriority } from "../utils/roles";

function Home() {
  const navigate = useNavigate();
  const storeUser = useAuthStore((state) => state.user);
  const user = storeUser ?? readPersistedSession()?.user;

  if (!user) {
    return (
      <div className={styles.main} style={{ padding: "2rem", textAlign: "center" }}>
        <p>Загрузка профиля...</p>
      </div>
    );
  }

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const topRole = sortRolesByPriority(user.roles || [])[0];
  const initials =
    `${String(user.lastName || "").charAt(0)}${String(user.firstName || "").charAt(0)}`.toUpperCase() ||
    "?";

  return (
    <>
      <Header />
      <main className={styles.main}>
        <section
          className={`${styles.profileWelcome} ${styles.profileWelcomeNew}`}
          aria-label="Ваш профиль"
        >
          <p className={styles.profileWelcomeBadge}>
            Добро пожаловать в Books Club!
          </p>
          <div className={styles.profileWelcomeInner}>
            <div className={styles.profileAvatar}>{initials}</div>
            <div className={styles.profileDetails}>
              <span className={styles.profileLabel}>Мой профиль</span>
              <h2 className={styles.profileName}>{displayName || "Пользователь"}</h2>
              {user.email && <p className={styles.profileEmail}>{user.email}</p>}
              {topRole && (
                <span className={styles.profileRole}>{getRoleLabel(topRole)}</span>
              )}
            </div>
            <button
              type="button"
              className={styles.profileEditBtn}
              onClick={() => navigate("/settings")}
            >
              Настройки
            </button>
          </div>
        </section>

        <section className={styles.hero}>
          <div className={styles.heroOrb} aria-hidden="true" />
          <div className={styles.heroOrbSecondary} aria-hidden="true" />

          <span className={styles.heroBadge}>Arête · Книжный клуб</span>

          <h1 className={styles.titleStyls}>
            Books
            <span className={styles.titleAccent}> Club</span>
          </h1>

          <p className={`${styles.subtextTitle} ${styles.tecstUppercase}`}>
            Космос идей. Вселенная книг.
          </p>

          <div className={styles.heroActions}>
            <button
              type="button"
              className={`${styles.tecstUppercase} ${styles.buttonPrimary}`}
              onClick={() => navigate("/settings")}
            >
              Мой профиль
            </button>
            <button
              type="button"
              className={`${styles.tecstUppercase} ${styles.buttonGhost}`}
              onClick={() => navigate("/happenings")}
            >
              Мероприятия
            </button>
          </div>

          <ul className={styles.heroStats} aria-label="О клубе">
            <li>
              <strong>Книги</strong>
              <span>обсуждения и рецензии</span>
            </li>
            <li>
              <strong>Искусство</strong>
              <span>кино, дизайн, поэзия</span>
            </li>
            <li>
              <strong>Сообщество</strong>
              <span>рост и вдохновение</span>
            </li>
          </ul>
        </section>

        <section className={styles.aboutPanel}>
          <span className={styles.sectionLabel}>О нас</span>
          <h2 className={styles.titleCenter}>Созвездие искателей</h2>
          <div className={styles.aboutText}>
            <p className={styles.textRegulirovca}>
              Arête — это постоянное стремление к совершенству и полной
              реализации своего потенциала. Мы начали с книг, ведь именно они
              зажигают в нас первые звёзды любознательности. Но наш путь не
              заканчивается на этом — он только начинается.
            </p>
            <p className={styles.textRegulirovca}>
              Наш клуб — это созвездие искателей. Мы — навигаторы в
              безграничном космосе искусства, дизайна, кино, литературы и
              многого другого.
            </p>
            <p className={styles.textRegulirovca}>
              Здесь мы помогаем друг другу прокладывать путь к своим звёздам,
              делимся взглядами для расширения кругозора и вдохновением для
              души.
            </p>
            <p className={`${styles.textRegulirovca} ${styles.textHighlight}`}>
              Мы оставляем границы позади, чтобы достичь своей Arête.
            </p>
          </div>
        </section>

        <section className={styles.eventsSection}>
          <SlayderSessions />
        </section>

        <section className={styles.cards}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionLabel}>Публикации</span>
            <div className={styles.h3title}>
              <img src="/img/zvezda.svg" alt="" aria-hidden="true" />
              <h3>Газета</h3>
              <img src="/img/zvezda.svg" alt="" aria-hidden="true" />
            </div>
          </div>
          <PoemCard />
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Home;
