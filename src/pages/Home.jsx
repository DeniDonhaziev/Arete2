import styles from "../scss/pages/home.module.scss";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HomeHero from "../components/HomeHero";
import SlayderSessions from "../components/SlayderSessions";
import PoemCard from "../components/PoemCard";
import { useAuthStore } from "../store/authStore";
import { readPersistedSession } from "../utils/authStorage";
import { getRoleLabel, sortRolesByPriority } from "../utils/roles";

function Home() {
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
        <HomeHero
          user={user}
          displayName={displayName}
          initials={initials}
          topRole={topRole}
          roleLabel={topRole ? getRoleLabel(topRole) : ""}
        />

        <section className={styles.aboutPanel}>
          <span className={styles.sectionLabel}>О нас</span>
          <h2 className={styles.titleCenter}>Созвездие искателей</h2>
          <div className={styles.aboutText}>
            <p className={styles.textRegulirovca}>
              Arête — это постоянное стремление к совершенству и полной
              реализации своего потенциала. Мы начали с книг, ведь именно они
              зажигают в нас первые звёзды любознательности.
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
