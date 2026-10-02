/**
 * Обёртка над localStorage. Любая операция может бросить исключение
 * (приватный режим, переполнение квоты, запрет cookies), поэтому всё в try/catch:
 * приложение должно работать и без сохранения.
 */
import type { z } from 'zod';

/** Читает и валидирует значение по схеме; повреждённые или устаревшие данные дают null. */
export function readJson<S extends z.ZodType>(key: string, schema: S): z.output<S> | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeItem(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // нечего делать: хранилище недоступно
  }
}
