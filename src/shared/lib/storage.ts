/**
 * Обёртка над localStorage. Любая операция может бросить исключение
 * (приватный режим, переполнение квоты, запрет cookies), поэтому всё в try/catch:
 * приложение должно работать и без сохранения.
 */

export function readJson<T>(key: string, isValid: (value: unknown) => value is T): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : null;
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
