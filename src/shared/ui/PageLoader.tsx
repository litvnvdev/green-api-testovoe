import { Spinner } from './Spinner';
import styles from './PageLoader.module.css';

/** Полноэкранный лоадер: первая загрузка приложения или страницы. */
export function PageLoader() {
  return (
    <div className={styles.page}>
      <Spinner size={32} label="Загрузка" />
    </div>
  );
}
