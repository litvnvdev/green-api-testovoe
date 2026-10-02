export const MIN_PHONE_DIGITS = 10;
export const MAX_PHONE_DIGITS = 15;

/** Оставляет только цифры; российский 8XXXXXXXXXX превращает в 7XXXXXXXXXX. */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) {
    return `7${digits.slice(1)}`;
  }
  return digits;
}

export type PhoneValidation = { ok: true; digits: string } | { ok: false; error: string };

export function validatePhone(input: string): PhoneValidation {
  const digits = normalizePhone(input);
  if (digits.length === 0) {
    return { ok: false, error: 'Введите номер телефона.' };
  }
  if (digits.length < MIN_PHONE_DIGITS || digits.length > MAX_PHONE_DIGITS) {
    return {
      ok: false,
      error: `Номер должен содержать от ${MIN_PHONE_DIGITS} до ${MAX_PHONE_DIGITS} цифр с кодом страны.`,
    };
  }
  return { ok: true, digits };
}

export function toChatId(digits: string): string {
  return `${digits}@c.us`;
}

/** 79001234567@c.us → +7 900 123-45-67; прочие номера → +<цифры>. */
export function formatChatId(chatId: string): string {
  const digits = chatId.replace(/@.*$/, '');
  const ru = /^7(\d{3})(\d{3})(\d{2})(\d{2})$/.exec(digits);
  if (ru) return `+7 ${ru[1]} ${ru[2]}-${ru[3]}-${ru[4]}`;
  return `+${digits}`;
}
