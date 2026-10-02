import { z } from 'zod';

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

/** Номер в любом виде → только цифры с кодом страны. На выходе схемы — нормализованная строка. */
export const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Введите номер телефона.')
  .transform(normalizePhone)
  .pipe(
    z
      .string()
      .regex(
        new RegExp(String.raw`^\d{${MIN_PHONE_DIGITS},${MAX_PHONE_DIGITS}}$`),
        `Номер должен содержать от ${MIN_PHONE_DIGITS} до ${MAX_PHONE_DIGITS} цифр с кодом страны.`,
      ),
  );

export type PhoneValidation = { ok: true; digits: string } | { ok: false; error: string };

export function validatePhone(input: string): PhoneValidation {
  const result = phoneSchema.safeParse(input);
  if (result.success) return { ok: true, digits: result.data };
  return { ok: false, error: result.error.issues[0]?.message ?? 'Неверный номер.' };
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
