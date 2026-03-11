'use client';

import { memo, useMemo } from 'react';
import { CATALOG, CATEGORIES, formatCurrency, declOfNum, getCategoryName, Service } from '@/lib/catalog';

interface ServicesProps {
  selectedCategory: string | null;
  searchQuery: string;
  onClearSearch: () => void;
}

// Минимальная длина поискового запроса
const MIN_SEARCH_LENGTH = 2;
// Максимальное количество результатов поиска
const MAX_SEARCH_RESULTS = 50;

// Подсветка совпадений в тексте
const highlight = (text: string, query: string) => {
  if (!query || query.length < MIN_SEARCH_LENGTH) return text;

  try {
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="bg-primary/20 px-0.5 rounded font-semibold">{part}</span>
      ) : part
    );
  } catch {
    // Если regex не сработал, возвращаем исходный текст
    return text;
  }
};

// Компонент одной услуги
const ServiceItem = memo(function ServiceItem({
  service,
  searchQuery,
  showCategory,
}: {
  service: Service & { catName?: string };
  searchQuery: string;
  showCategory: boolean;
}) {
  return (
    <article className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-card border border-border hover:border-primary hover:translate-x-1 hover:shadow-lg transition-all touch-manipulation">
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-sm sm:text-base mb-0.5">
          {highlight(service.n, searchQuery)}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
          {highlight(service.d, searchQuery)}
          {showCategory && service.catName && <span className="ml-1 opacity-60">• {service.catName}</span>}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="font-extrabold text-sm sm:text-base gradient-text tabular-nums">
          {formatCurrency(service.p)}
        </div>
        <div className="text-[10px] sm:text-xs text-muted-foreground font-semibold">за {service.u}</div>
      </div>
    </article>
  );
});

// Пустое состояние
const EmptyState = memo(function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 sm:py-16 text-muted-foreground">
      <div className="text-base font-bold text-foreground mb-2">{message}</div>
    </div>
  );
});

// Результаты поиска
const SearchInfo = memo(function SearchInfo({ count, onClear }: { count: number; onClear: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3 p-3 rounded-xl bg-primary/5">
      <span className="text-sm">
        Найдено: <strong className="text-primary">{count}</strong> {declOfNum(count, ['услуга', 'услуги', 'услуг'])}
      </span>
      <button
        onClick={onClear}
        className="text-sm font-semibold text-primary hover:underline touch-manipulation"
        aria-label="Сбросить поиск"
      >
        Сбросить
      </button>
    </div>
  );
});

export function Services({ selectedCategory, searchQuery, onClearSearch }: ServicesProps) {
  // Флаг: активен ли поиск
  const isSearchActive = searchQuery.length >= MIN_SEARCH_LENGTH;

  // Поиск по всем услугам
  const searchResults = useMemo(() => {
    if (!isSearchActive) return null;

    const query = searchQuery.toLowerCase();
    const results: (Service & { catName: string })[] = [];

    for (const [catId, items] of Object.entries(CATALOG)) {
      for (const item of items) {
        if (item.n.toLowerCase().includes(query) || item.d.toLowerCase().includes(query)) {
          results.push({ ...item, catName: getCategoryName(catId) });
        }
      }
    }

    return results.slice(0, MAX_SEARCH_RESULTS);
  }, [searchQuery, isSearchActive]);

  // Категория не выбрана и поиск не активен
  if (!selectedCategory && searchResults === null) {
    return null;
  }

  // Поиск активен
  if (searchResults !== null) {
    if (searchResults.length === 0) {
      return <EmptyState message="Ничего не найдено" />;
    }

    return (
      <section aria-label="Результаты поиска">
        <SearchInfo count={searchResults.length} onClear={onClearSearch} />
        <div className="flex flex-col gap-2">
          {searchResults.map((service) => (
            <ServiceItem key={service.id} service={service} searchQuery={searchQuery} showCategory />
          ))}
        </div>
      </section>
    );
  }

  // Показываем услуги выбранной категории
  // На этом этапе selectedCategory гарантированно не null (проверка выше)
  if (!selectedCategory) {
    return null;
  }

  const services = CATALOG[selectedCategory] || [];
  const category = CATEGORIES.find((c) => c.id === selectedCategory);
  const categoryName = category?.name || '';

  return (
    <section aria-label={`Услуги категории ${categoryName}`}>
      <header className="flex items-center justify-between mb-3">
        <h2 className="text-lg sm:text-xl font-extrabold">{categoryName}</h2>
        <span className="text-xs bg-muted px-3 py-1.5 rounded-full font-semibold">
          {services.length} {declOfNum(services.length, ['услуга', 'услуги', 'услуг'])}
        </span>
      </header>
      <div className="flex flex-col gap-2">
        {services.map((service) => (
          <ServiceItem key={service.id} service={service} searchQuery="" showCategory={false} />
        ))}
      </div>
    </section>
  );
}
