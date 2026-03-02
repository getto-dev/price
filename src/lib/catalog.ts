// Типы данных
export interface Service {
  id: string;
  n: string;  // name
  d: string;  // description
  u: string;  // unit
  p: number;  // price
}

export interface Category {
  id: string;
  name: string;
}

export interface CatalogData {
  version: string;
  updated: string;
  categories: Category[];
  services: Record<string, Service[]>;
}

// URL для загрузки прайс-листа
const CATALOG_URL = 'https://raw.githubusercontent.com/getto-dev/price-data/main/catalog.json';

// Кэшированные данные
let cachedData: CatalogData | null = null;

// Загрузка прайс-листа
export async function loadCatalog(): Promise<CatalogData> {
  if (cachedData) return cachedData;
  
  const response = await fetch(CATALOG_URL);
  if (!response.ok) throw new Error('Failed to load catalog');
  
  cachedData = await response.json();
  return cachedData!;
}

// Синхронный доступ к кэшированным данным
export function getCatalog(): CatalogData | null {
  return cachedData;
}

// Категории (для SSR/SSG)
export const CATEGORIES: Category[] = [
  { id: 'heating', name: 'Отопление' },
  { id: 'floor_heat', name: 'Теплый пол' },
  { id: 'water', name: 'Водоснабжение' },
  { id: 'boilers', name: 'Котельные' },
  { id: 'chimneys', name: 'Дымоходы' },
  { id: 'sewerage', name: 'Канализация' },
  { id: 'pipes', name: 'Прокладка труб' },
  { id: 'filtration', name: 'Водоочистка' },
  { id: 'automation', name: 'Автоматика' },
  { id: 'grooving', name: 'Штробление' },
  { id: 'service', name: 'Сервис' },
  { id: 'plumbing', name: 'Сантехника' },
];

// Форматирование валюты
export const formatCurrency = (value: number): string => {
  if (value === 0) return 'по факту';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
};

// Склонение слов
export const declOfNum = (n: number, titles: [string, string, string]): string => {
  const cases = [2, 0, 1, 1, 1, 2];
  return titles[(n % 100 > 4 && n % 100 < 20) ? 2 : cases[(n % 10 < 5) ? n % 10 : 5]];
};

// Получить название категории по ID
export const getCategoryName = (id: string): string => {
  return CATEGORIES.find(c => c.id === id)?.name || '';
};
