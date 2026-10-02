import styles from './Avatar.module.css';

// Цвета аватаров из палитры MAX.
const COLORS = ['#5ec7ce', '#78b1f5', '#a79dff', '#f78fb7', '#f2ab7d'];

function colorFor(id: string): string {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return COLORS[Math.abs(hash) % COLORS.length] ?? '#78b1f5';
}

function initials(name: string | undefined, fallback: string): string {
  if (name) {
    const letters = name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? '');
    if (letters.length > 0) return letters.join('');
  }
  // Для номера — две последние цифры, как подпись «контакта без имени».
  return fallback.replace(/\D/g, '').slice(-2);
}

interface AvatarProps {
  id: string;
  name?: string;
  size?: number;
}

export function Avatar({ id, name, size = 48 }: AvatarProps) {
  const color = colorFor(id);
  return (
    <span
      className={styles.avatar}
      style={{ width: size, height: size, fontSize: size * 0.36, color, background: `${color}29` }}
      aria-hidden="true"
    >
      {initials(name, id)}
    </span>
  );
}
