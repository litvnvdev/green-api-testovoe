import styles from './Spinner.module.css';

interface SpinnerProps {
  size?: number;
  /** Текст для скринридеров; без него спиннер считается декоративным. */
  label?: string;
}

export function Spinner({ size = 20, label }: SpinnerProps) {
  return (
    <span
      className={styles.spinner}
      style={{ width: size, height: size }}
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
