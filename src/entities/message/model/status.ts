import type { MessageStatus } from './types';

/** Порядок «успешных» статусов: вебхуки приходят не по порядку, статус не должен откатываться. */
const PROGRESS: Record<Exclude<MessageStatus, 'failed'>, number> = {
  sending: 0,
  sent: 1,
  delivered: 2,
  read: 3,
};

/**
 * Итоговый статус после нового события. failed принимается, только если сообщение ещё
 * не дошло до получателя; доставленное или прочитанное уже не может стать неотправленным.
 */
export function mergeStatus(current: MessageStatus, next: MessageStatus): MessageStatus {
  if (next === 'failed') return current === 'delivered' || current === 'read' ? current : 'failed';
  if (current === 'failed') return next;
  return PROGRESS[next] > PROGRESS[current] ? next : current;
}
