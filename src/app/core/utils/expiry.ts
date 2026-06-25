/** Утилиты для оценки срока действия документов (формат даты — дд.мм.гггг). */

/** За сколько дней до конца срока документ считается «скоро истекающим». */
export const EXPIRY_WARNING_DAYS = 15;

/** Состояние срока действия документа. */
export type ExpiryState = 'valid' | 'expiring' | 'expired';

/** Парсит дату формата дд.мм.гггг в Date (или undefined, если строка некорректна). */
export function parseRuDate(value?: string): Date | undefined {
  if (!value) {
    return undefined;
  }
  const match = value.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) {
    return undefined;
  }
  const [, dd, mm, yyyy] = match;
  const day = Number(dd);
  const month = Number(mm) - 1;
  const date = new Date(Number(yyyy), month, day);
  // Отсев несуществующих дат (например, 31.02.2026).
  if (date.getDate() !== day || date.getMonth() !== month) {
    return undefined;
  }
  return date;
}

/** Сколько целых дней осталось до даты (отрицательное — уже просрочено). */
export function daysUntilRuDate(value?: string, now = new Date()): number | undefined {
  const date = parseRuDate(value);
  if (!date) {
    return undefined;
  }
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((date.getTime() - startOfToday.getTime()) / 86_400_000);
}

/** Состояние срока: просрочен / скоро истекает / в порядке (или без даты). */
export function expiryState(validTo?: string, now = new Date()): ExpiryState {
  const days = daysUntilRuDate(validTo, now);
  if (days === undefined) {
    return 'valid';
  }
  if (days < 0) {
    return 'expired';
  }
  return days <= EXPIRY_WARNING_DAYS ? 'expiring' : 'valid';
}

/** Русское склонение слова «день» по числу. */
function pluralDays(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  let word = 'дней';
  if (mod10 === 1 && mod100 !== 11) {
    word = 'день';
  } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    word = 'дня';
  }
  return `${n} ${word}`;
}

/** Подпись о сроке для подсветки: пустая строка, если подсвечивать нечего. */
export function expiryLabel(validTo?: string, now = new Date()): string {
  const days = daysUntilRuDate(validTo, now);
  if (days === undefined || days > EXPIRY_WARNING_DAYS) {
    return '';
  }
  if (days < 0) {
    return `просрочен ${pluralDays(-days)} назад`;
  }
  if (days === 0) {
    return 'истекает сегодня';
  }
  return `истекает через ${pluralDays(days)}`;
}
