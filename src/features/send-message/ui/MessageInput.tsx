import { useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { SendIcon } from '@/shared/ui';
import styles from './MessageInput.module.css';

/** Лимит sendMessage в GREEN-API. */
const MAX_LENGTH = 20_000;
const MAX_HEIGHT = 160;

interface MessageInputProps {
  onSend: (text: string) => void;
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = text.trim().length > 0;

  // Авто-высота textarea по содержимому.
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_HEIGHT)}px`;
    // Полоса прокрутки нужна, только когда текст выше максимальной высоты.
    textarea.style.overflowY = textarea.scrollHeight > MAX_HEIGHT ? 'auto' : 'hidden';
  }, [text]);

  function submit() {
    const message = text.trim();
    if (!message) return;
    onSend(message);
    setText('');
    textareaRef.current?.focus();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter — отправить, Shift+Enter — перенос. Во время набора через IME Enter не трогаем.
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label htmlFor="message-input" className="visually-hidden">
        Сообщение
      </label>
      <textarea
        id="message-input"
        ref={textareaRef}
        className={styles.textarea}
        rows={1}
        maxLength={MAX_LENGTH}
        placeholder="Сообщение"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
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
