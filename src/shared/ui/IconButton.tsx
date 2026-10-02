import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './IconButton.module.css';

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Подпись для скринридеров и всплывающей подсказки — у кнопки нет видимого текста. */
  label: string;
  icon: ReactNode;
  tone?: 'default' | 'accent';
}

export function IconButton({
  label,
  icon,
  tone = 'default',
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={[styles.button, className].filter(Boolean).join(' ')}
      data-tone={tone}
      aria-label={label}
      title={label}
      {...rest}
    >
      {icon}
    </button>
  );
}
