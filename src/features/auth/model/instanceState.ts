import type { InstanceState } from '@/shared/api';

const STATE_MESSAGES: Record<Exclude<InstanceState, 'authorized'>, string> = {
  notAuthorized:
    'Инстанс не привязан к WhatsApp. Отсканируйте QR-код в личном кабинете GREEN-API и попробуйте снова.',
  blocked: 'Аккаунт WhatsApp заблокирован.',
  sleepMode: 'Телефон с WhatsApp не в сети (режим сна). Проверьте телефон.',
  starting: 'Инстанс запускается. Подождите пару минут и попробуйте снова.',
  yellowCard: 'WhatsApp временно ограничил отправку сообщений (yellowCard).',
};

/** Понятное объяснение, почему с инстансом нельзя работать. */
export function describeInstanceState(state: string): string {
  return (
    STATE_MESSAGES[state as keyof typeof STATE_MESSAGES] ??
    `Инстанс не готов к работе (состояние: ${state}).`
  );
}
