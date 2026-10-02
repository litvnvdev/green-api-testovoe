import { useState, type FormEvent } from 'react';
import { useChat } from '../context/ChatContext';
import { toChatId, validatePhone } from '../utils/phone';
import { CloseIcon } from './Icons';
import styles from './NewChatForm.module.css';

interface NewChatFormProps {
  onDone: () => void;
}

export function NewChatForm({ onDone }: NewChatFormProps) {
  const { openChat } = useChat();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validatePhone(phone);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    // Если чат с этим номером уже есть — просто откроется он.
    openChat(toChatId(result.digits));
    onDone();
  }

  return (
    <form id="new-chat-form" className={styles.form} onSubmit={handleSubmit} noValidate>
      <label htmlFor="new-chat-phone" className={styles.label}>
        Номер телефона получателя
      </label>
      <div className={styles.row}>
        <input
          id="new-chat-phone"
          className={styles.input}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+7 900 123-45-67"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onDone();
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'new-chat-error' : 'new-chat-hint'}
          autoFocus
        />
        <button type="submit" className={styles.submit}>
          Создать
        </button>
        <button
          type="button"
          className={styles.close}
          onClick={onDone}
          aria-label="Отмена"
          title="Отмена"
        >
          <CloseIcon width={20} height={20} />
        </button>
      </div>
      {error ? (
        <p id="new-chat-error" className={styles.error} role="alert">
          {error}
        </p>
      ) : (
        <p id="new-chat-hint" className={styles.hint}>
          С кодом страны. Российский номер можно начинать с 8.
        </p>
      )}
    </form>
  );
}
