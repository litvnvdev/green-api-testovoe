import { zodResolver } from '@hookform/resolvers/zod';
import { useLayoutEffect, useState, type KeyboardEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { MAX_MESSAGE_LENGTH } from '@/shared/api';
import { fitTextareaHeight } from '@/shared/lib';
import { SendIcon } from '@/shared/ui';
import { messageFormSchema } from '../model/schema';
import styles from './MessageInput.module.css';

const MAX_HEIGHT = 160;

interface MessageInputProps {
  onSend: (text: string) => void;
}

export function MessageInput({ onSend }: MessageInputProps) {
  const { register, handleSubmit, reset, setFocus, control } = useForm({
    resolver: zodResolver(messageFormSchema),
    defaultValues: { text: '' },
  });
  const text = useWatch({ control, name: 'text' });
  const canSend = messageFormSchema.safeParse({ text }).success;

  // register отдаёт свой ref; сам элемент храним в state — он нужен эффекту авто-высоты.
  const { ref: registerRef, ...field } = register('text');
  const [textarea, setTextarea] = useState<HTMLTextAreaElement | null>(null);

  // Авто-высота textarea по содержимому (в том числе сброс после отправки).
  useLayoutEffect(() => {
    if (textarea) fitTextareaHeight(textarea, MAX_HEIGHT);
  }, [textarea, text]);

  // Схема уже обрезала пробелы по краям.
  const submit = handleSubmit(({ text: message }) => {
    onSend(message);
    reset();
    setFocus('text');
  });

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter — отправить, Shift+Enter — перенос. Во время набора через IME Enter не трогаем.
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void submit();
    }
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <label htmlFor="message-input" className="visually-hidden">
        Сообщение
      </label>
      <textarea
        id="message-input"
        className={styles.textarea}
        rows={1}
        maxLength={MAX_MESSAGE_LENGTH}
        placeholder="Сообщение"
        onKeyDown={handleKeyDown}
        autoFocus
        {...field}
        ref={(element) => {
          registerRef(element);
          setTextarea(element);
        }}
      />
      <button
        type="submit"
        className={styles.send}
        disabled={!canSend}
        aria-label="Отправить"
        title="Отправить (Enter)"
      >
        <SendIcon width={22} height={22} />
      </button>
    </form>
  );
}
