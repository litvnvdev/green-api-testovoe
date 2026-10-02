import { describe, expect, it } from 'vitest';
import { mergeStatus } from './status';

describe('mergeStatus', () => {
  it('статус продвигается вперёд', () => {
    expect(mergeStatus('sent', 'delivered')).toBe('delivered');
    expect(mergeStatus('delivered', 'read')).toBe('read');
  });

  it('опоздавший вебхук не откатывает статус', () => {
    expect(mergeStatus('read', 'delivered')).toBe('read');
    expect(mergeStatus('read', 'sent')).toBe('read');
  });

  it('failed не перекрывает доставленное сообщение', () => {
    expect(mergeStatus('delivered', 'failed')).toBe('delivered');
    expect(mergeStatus('sent', 'failed')).toBe('failed');
  });

  it('после failed возможен успех (например, после повтора)', () => {
    expect(mergeStatus('failed', 'sent')).toBe('sent');
  });
});
