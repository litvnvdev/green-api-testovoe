import type { InstanceSettings } from './types';

/**
 * Проверяет настройки инстанса, без которых входящие не попадут в очередь receiveNotification.
 * Возвращает тексты предупреждений для пользователя (пустой массив — всё в порядке).
 */
export function settingsWarnings(settings: InstanceSettings): string[] {
  const warnings: string[] = [];
  if (settings.incomingWebhook !== 'yes') {
    warnings.push(
      'В настройках инстанса выключено «Получать уведомления о входящих сообщениях» (incomingWebhook). Ответы не будут приходить.',
    );
  }
  if (settings.webhookUrl.trim() !== '') {
    warnings.push(
      'В настройках инстанса указан URL для вебхуков (webhookUrl). Уведомления уходят на него, а не в очередь HTTP API — очистите поле.',
    );
  }
  if (settings.outgoingWebhook !== undefined && settings.outgoingWebhook !== 'yes') {
    warnings.push(
      'Выключены уведомления о статусах отправленных сообщений (outgoingWebhook): отметки «доставлено» и «прочитано» не будут обновляться.',
    );
  }
  return warnings;
}
