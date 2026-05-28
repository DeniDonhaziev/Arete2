import styles from '../scss/pages/notFoundPage.module.scss';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className={styles.notFound}>
      <div className={styles.notFoundContent}>
        <h1 className={styles.notFoundTitle}>404</h1>
        <p className={styles.notFoundText}>
          Страница не найдена. Возможно, она была удалена или перемещена.
        </p>
        <Link to="/" className={styles.notFoundButton}>
          На главную
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;