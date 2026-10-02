import { describe, expect, it } from 'vitest';
import { settingsWarnings } from './settings';

describe('settingsWarnings', () => {
  it('нет предупреждений при правильных настройках', () => {
    expect(settingsWarnings({ webhookUrl: '', incomingWebhook: 'yes' })).toEqual([]);
  });

  it('предупреждает о выключенных входящих', () => {
    const warnings = settingsWarnings({ webhookUrl: '', incomingWebhook: 'no' });
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('incomingWebhook');
  });

  it('предупреждает о заполненном webhookUrl', () => {
    const warnings = settingsWarnings({
      webhookUrl: 'https://example.com/hook',
      incomingWebhook: 'yes',
    });
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('webhookUrl');
  });

  it('подсказывает включить статусы отправленных сообщений', () => {
    const warnings = settingsWarnings({
      webhookUrl: '',
      incomingWebhook: 'yes',
      outgoingWebhook: 'no',
    });
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('outgoingWebhook');
  });
});
