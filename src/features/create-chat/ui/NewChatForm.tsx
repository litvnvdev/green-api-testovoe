import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { useChatActions } from '@/entities/chat';
import { chatPath } from '@/shared/config';
import { toChatId } from '@/shared/lib';
import { CloseIcon } from '@/shared/ui';
import { newChatSchema } from '../model/schema';
import styles from './NewChatForm.module.css';

interface NewChatFormProps {
  onDone: () => void;
}

export function NewChatForm({ onDone }: NewChatFormProps) {
  const { addChat } = useChatActions();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(newChatSchema), defaultValues: { phone: '' } });
  const error = errors.phone?.message;

  // phone уже нормализован схемой: только цифры, 8XXXXXXXXXX → 7XXXXXXXXXX.
  function onSubmit({ phone }: { phone: string }) {
    // Если чат с этим номером уже есть — просто откроется он.
    const chatId = toChatId(phone);
    addChat(chatId);
    navigate(chatPath(chatId));
    onDone();
  }

  return (
    <form id="new-chat-form" className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
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
          onKeyDown={(e) => {
            if (e.key === 'Escape') onDone();
          }}
          aria-invalid={Boolean(error)}
          aria-describedby="new-chat-message"
          autoFocus
          {...register('phone')}
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
      <p
        id="new-chat-message"
        className={error ? styles.error : styles.hint}
        role={error ? 'alert' : undefined}
      >
        {error ?? 'С кодом страны. Российский номер можно начинать с 8.'}
      </p>
    </form>
  );
}
