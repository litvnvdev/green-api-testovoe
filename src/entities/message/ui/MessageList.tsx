import { Fragment, useLayoutEffect, useRef, type ReactNode } from 'react';
import { formatDayLabel, formatTime, isSameDay } from '@/shared/lib';
import { AlertIcon, CheckIcon, ClockIcon, DoubleCheckIcon } from '@/shared/ui';
import type { ChatMessage } from '../model/types';
import styles from './MessageList.module.css';

interface MessageListProps {
  messages: ChatMessage[];
  /** Слот под пузырём: например, кнопка повторной отправки из фичи send-message. */
  renderFooter?: (message: ChatMessage) => ReactNode;
}

/** Отметки как в мессенджерах: часы, одна галочка, две серые, две синие. */
function StatusMark({ message }: { message: ChatMessage }) {
  if (message.direction === 'in') return null;
  switch (message.status) {
    case 'sending':
      return <ClockIcon className={styles.statusIcon} aria-label="Отправляется" role="img" />;
    case 'failed':
      return <AlertIcon className={styles.failedIcon} aria-label="Не отправлено" role="img" />;
    case 'sent':
      return <CheckIcon className={styles.statusIcon} aria-label="Отправлено" role="img" />;
    case 'delivered':
      return <DoubleCheckIcon className={styles.statusIcon} aria-label="Доставлено" role="img" />;
    case 'read':
      return <DoubleCheckIcon className={styles.readIcon} aria-label="Прочитано" role="img" />;
  }
}

export function MessageList({ messages, renderFooter }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const last = messages[messages.length - 1];

  // Автоскролл вниз при открытии чата и при каждом новом последнем сообщении.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [last?.id]);

  if (messages.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Сообщений пока нет. Напишите первым!</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={styles.list}
      role="log"
      aria-live="polite"
      aria-label="Сообщения"
      tabIndex={0}
    >
      <ol className={styles.items}>
        {messages.map((message, index) => {
          const prev = messages[index - 1];
          const newDay = !prev || !isSameDay(prev.timestamp, message.timestamp);
          // Подряд идущие сообщения одного направления группируются визуально.
          const grouped = !newDay && prev?.direction === message.direction;
          return (
            <Fragment key={message.id}>
              {newDay && (
                <li className={styles.day} aria-hidden="true">
                  <span>{formatDayLabel(message.timestamp)}</span>
                </li>
              )}
              <li className={styles.row} data-direction={message.direction} data-grouped={grouped}>
                <div className={styles.bubble} data-status={message.status}>
                  <span className={styles.visuallyHidden}>
                    {message.direction === 'out' ? 'Вы: ' : 'Собеседник: '}
                  </span>
                  <span className={styles.text}>{message.text}</span>
                  <span className={styles.meta}>
                    <time dateTime={new Date(message.timestamp).toISOString()}>
                      {formatTime(message.timestamp)}
                    </time>
                    <StatusMark message={message} />
                  </span>
                </div>
                {renderFooter?.(message)}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </div>
  );
}
