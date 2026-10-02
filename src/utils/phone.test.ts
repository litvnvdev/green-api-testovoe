import { describe, expect, it } from 'vitest';
import { formatChatId, normalizePhone, toChatId, validatePhone } from './phone';

describe('normalizePhone', () => {
  it('убирает всё, кроме цифр', () => {
    expect(normalizePhone('+7 (900) 123-45-67')).toBe('79001234567');
  });

  it('превращает российский 8XXXXXXXXXX в 7XXXXXXXXXX', () => {
    expect(normalizePhone('8 900 123 45 67')).toBe('79001234567');
  });

  it('не трогает 8 в начале номера другой длины', () => {
    expect(normalizePhone('+86 138 0013 8000')).toBe('8613800138000');
  });
});

describe('validatePhone', () => {
  it('принимает корректный номер', () => {
    expect(validatePhone('+7 900 123-45-67')).toEqual({ ok: true, digits: '79001234567' });
  });

  it('отклоняет пустой ввод', () => {
    expect(validatePhone('  ')).toMatchObject({ ok: false });
  });

  it('отклоняет слишком короткий и слишком длинный номер', () => {
    expect(validatePhone('12345').ok).toBe(false);
    expect(validatePhone('1234567890123456').ok).toBe(false);
  });

  it('граничные значения 10 и 15 цифр допустимы', () => {
    expect(validatePhone('1234567890').ok).toBe(true);
    expect(validatePhone('123456789012345').ok).toBe(true);
  });
});

describe('chatId', () => {
  it('строит chatId', () => {
    expect(toChatId('79001234567')).toBe('79001234567@c.us');
  });

  it('форматирует российский номер для показа', () => {
    expect(formatChatId('79001234567@c.us')).toBe('+7 900 123-45-67');
  });

  it('форматирует прочие номера как +цифры', () => {
    expect(formatChatId('491701234567@c.us')).toBe('+491701234567');
  });
});
