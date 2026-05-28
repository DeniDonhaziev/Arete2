import styles from "../scss/components/authLoading.module.scss";

const AuthLoading = () => (
  <div className={styles.wrapper} role="status" aria-live="polite">
    <div className={styles.spinner} aria-hidden="true" />
    <p className={styles.text}>Загрузка...</p>
  </div>
);

export default AuthLoading;
