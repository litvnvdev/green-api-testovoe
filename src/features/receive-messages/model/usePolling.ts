import { useEffect, useRef, useState } from 'react';
import {
  deleteNotification,
  GreenApiError,
  receiveNotification,
  type Credentials,
  type WebhookBody,
} from '@/shared/api';

/** Пауза после пустой очереди (поверх 5-секундного long polling самого receiveNotification). */
const EMPTY_QUEUE_DELAY = 2_000;
const MAX_ERROR_DELAY = 30_000;

export type PollingStatus =
  | { state: 'idle' }
  | { state: 'connecting' }
  | { state: 'online' }
  | { state: 'error'; message: string; fatal: boolean };

// Константы, а не литералы: стабильная ссылка не дёргает зависимые useMemo.
const IDLE: PollingStatus = { state: 'idle' };
const CONNECTING: PollingStatus = { state: 'connecting' };
const ONLINE: PollingStatus = { state: 'online' };

/**
 * Цикл: receiveNotification → обработка → deleteNotification → сразу следующий запрос.
 * Следующий шаг планируется через setTimeout только после завершения предыдущего,
 * поэтому запросы не накладываются. Остановка — через AbortController при размонтировании
 * или смене кредов (выход).
 */
export function usePolling(
  credentials: Credentials | null,
  onNotification: (body: WebhookBody) => void,
): PollingStatus {
  // Статус привязан к кредам, для которых он получен: после смены кредов
  // старый статус не показывается, пока новый цикл не ответит.
  const [status, setStatus] = useState<{ owner: Credentials | null; value: PollingStatus }>({
    owner: null,
    value: IDLE,
  });
  // Обработчик держим в ref, чтобы его смена не перезапускала цикл.
  const handlerRef = useRef(onNotification);
  useEffect(() => {
    handlerRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    if (!credentials) return;
    const creds = credentials;

    const controller = new AbortController();
    const { signal } = controller;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let errorCount = 0;

    const report = (value: PollingStatus) => {
      if (signal.aborted) return;
      // Не плодим ререндеры, если статус не изменился (каждый успешный опрос — ONLINE).
      setStatus((prev) =>
        prev.owner === creds && prev.value === value ? prev : { owner: creds, value },
      );
    };

    const schedule = (delay: number) => {
      if (!signal.aborted) timer = setTimeout(tick, delay);
    };

    async function tick() {
      try {
        const notification = await receiveNotification(creds, signal);
        errorCount = 0;
        report(ONLINE);

        if (!notification) {
          schedule(EMPTY_QUEUE_DELAY);
          return;
        }

        try {
          handlerRef.current(notification.body);
        } finally {
          // Удаляем всегда, даже если уведомление проигнорировано, иначе оно придёт снова.
          // Если удаление не удалось — уведомление придёт повторно, дубль отсечёт дедупликация.
          await deleteNotification(creds, notification.receiptId, signal);
        }
        schedule(0);
      } catch (error) {
        if (signal.aborted) return;
        const apiError =
          error instanceof GreenApiError
            ? error
            : new GreenApiError('server', 'Не удалось обработать уведомление.');

        if (apiError.kind === 'auth') {
          // Повторять бессмысленно: токен сменили или инстанс удалён.
          report({ state: 'error', message: apiError.message, fatal: true });
          return;
        }

        errorCount += 1;
        report({ state: 'error', message: apiError.message, fatal: false });
        const base = apiError.kind === 'rateLimit' ? 10_000 : 2_000;
        schedule(Math.min(base * 2 ** (errorCount - 1), MAX_ERROR_DELAY));
      }
    }

    void tick();

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [credentials]);

  if (!credentials) return IDLE;
  if (status.owner !== credentials) return CONNECTING;
  return status.value;
}
