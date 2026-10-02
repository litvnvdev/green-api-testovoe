import { Fragment, useLayoutEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { formatDayLabel, formatTime, isSameDay } from '../utils/format';
import { AlertIcon, CheckIcon, ClockIcon } from './Icons';
import styles from './MessageList.module.css';

interface MessageListProps {
  messages: ChatMessage[];
  onRetry: (message: ChatMessage) => void;
}

function StatusMark({ message }: { message: ChatMessage }) {
  if (message.direction === 'in') return null;
  if (message.status === 'sending') {
    return <ClockIcon className={styles.statusIcon} aria-label="Отправляется" role="img" />;
  }
  if (message.status === 'failed') {
    return <AlertIcon className={styles.failedIcon} aria-label="Не отправлено" role="img" />;
  }
  return <CheckIcon className={styles.statusIcon} aria-label="Отправлено" role="img" />;
}

export function MessageList({ messages, onRetry }: MessageListProps) {
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
                {message.status === 'failed' && (
                  <button type="button" className={styles.retry} onClick={() => onRetry(message)}>
                    Не отправлено. Повторить
                  </button>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </div>
  );
}
