const timeFormat = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' });
const shortDateFormat = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
});
const dayFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });
const dayWithYearFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const DAY = 24 * 60 * 60 * 1000;

function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function formatTime(timestamp: number): string {
  return timeFormat.format(timestamp);
}

/** Для списка чатов: сегодня — время, вчера — «вчера», иначе дата. */
export function formatListDate(timestamp: number, now = Date.now()): string {
  const diff = startOfDay(now) - startOfDay(timestamp);
  if (diff <= 0) return formatTime(timestamp);
  if (diff === DAY) return 'вчера';
  return shortDateFormat.format(timestamp);
}

/** Разделитель дней в переписке. */
export function formatDayLabel(timestamp: number, now = Date.now()): string {
  const diff = startOfDay(now) - startOfDay(timestamp);
  if (diff <= 0) return 'Сегодня';
  if (diff === DAY) return 'Вчера';
  return new Date(timestamp).getFullYear() === new Date(now).getFullYear()
    ? dayFormat.format(timestamp)
    : dayWithYearFormat.format(timestamp);
}

export function isSameDay(a: number, b: number): boolean {
  return startOfDay(a) === startOfDay(b);
}
