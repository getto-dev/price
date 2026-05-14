import { CATEGORIES } from '@/lib/catalog';

/**
 * Форматирование числа в валюту (рубли)
 * 4500 → "4 500 ₽"
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString('ru-RU') + ' ₽';
}

/**
 * Склонение числительных в русском языке
 * declOfNum(1, ['услуга', 'услуги', 'услуг']) → 'услуга'
 * declOfNum(5, ['услуга', 'услуги', 'услуг']) → 'услуг'
 */
export function declOfNum(number: number, titles: [string, string, string]): string {
  const cases = [2, 0, 1, 1, 1, 2];
  const absNumber = Math.abs(number);
  const index = absNumber % 100 > 4 && absNumber % 100 < 20
    ? 2
    : cases[absNumber % 10 < 5 ? absNumber % 10 : 5];
  return titles[index];
}

/**
 * Получить название категории по её ID
 */
export function getCategoryName(catId: string): string {
  const category = CATEGORIES.find((c) => c.id === catId);
  return category?.name || catId;
}
