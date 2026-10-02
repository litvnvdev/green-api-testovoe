import { useId, type InputHTMLAttributes, type Ref } from 'react';
import styles from './TextField.module.css';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Текст ошибки: подсвечивает поле и связывается с ним через aria-describedby. */
  error?: string;
  /** Подсказка под полем, когда ошибки нет. */
  hint?: string;
  ref?: Ref<HTMLInputElement>;
}

/** Поле формы с подписью, подсказкой и ошибкой. Совместимо с register() из react-hook-form. */
export function TextField({ label, error, hint, id, ref, ...inputProps }: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;
  const message = error ?? hint;

  return (
    <div className={styles.field}>
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        ref={ref}
        aria-invalid={Boolean(error)}
        aria-describedby={message ? messageId : undefined}
        {...inputProps}
      />
      {message && (
        <span id={messageId} className={error ? styles.fieldError : styles.hint}>
          {message}
        </span>
      )}
    </div>
  );
}
