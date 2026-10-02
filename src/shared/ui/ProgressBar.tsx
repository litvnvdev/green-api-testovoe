import styles from './ProgressBar.module.css';

/** Тонкая полоса прогресса у верхнего края: идёт переход между страницами. */
export function ProgressBar({ active }: { active: boolean }) {
  return (
    <div
      className={styles.bar}
      data-active={active}
      role="progressbar"
      aria-hidden={!active}
      aria-label="Загрузка страницы"
    />
  );
}
