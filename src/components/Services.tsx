'use client';

import { memo, useMemo, useCallback } from 'react';
import { CATALOG, CATEGORIES, formatCurrency, declOfNum, getCategoryName, Service } from '@/lib/catalog';
import { cn } from '@/lib/utils';

interface ServicesProps {
  selectedCategory: string | null;
  searchQuery: string;
}

// Подсветка совпадений
const highlight = (text: string, query: string) => {
  if (!query || query.length < 2) return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span key={i} className="bg-primary/20 px-0.5 rounded font-semibold">
        {part}
      </span>
    ) : (
      part
    )
  );
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
    <article
      className={cn(
        'flex items-center gap-3 p-3 sm:p-4 rounded-xl',
        'bg-card border border-border',
        'hover:border-primary hover:translate-x-1 hover:shadow-lg',
        'transition-all touch-manipulation'
      )}
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-sm sm:text-base mb-0.5">
          {highlight(service.n, searchQuery)}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
          {highlight(service.d, searchQuery)}
          {showCategory && service.catName && (
            <span className="ml-1 opacity-60">• {service.catName}</span>
          )}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="font-extrabold text-sm sm:text-base gradient-text tabular-nums">
          {formatCurrency(service.p)}
        </div>
        <div className="text-[10px] sm:text-xs text-muted-foreground font-semibold">
          за {service.u}
        </div>
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
const SearchInfo = memo(function SearchInfo({
  count,
  onClear,
}: {
  count: number;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-3 p-3 rounded-xl bg-primary/5">
      <span className="text-sm">
        Найдено: <strong className="text-primary">{count}</strong>{' '}
        {declOfNum(count, ['услуга', 'услуги', 'услуг'])}
      </span>
      <button
        onClick={onClear}
        className="text-sm font-semibold text-primary hover:underline touch-manipulation"
      >
        Сбросить
      </button>
    </div>
  );
});

export function Services({ selectedCategory, searchQuery }: ServicesProps) {
  // Поиск по всем услугам
  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return null;

    const query = searchQuery.toLowerCase();
    const results: (Service & { catName: string })[] = [];

    Object.entries(CATALOG).forEach(([catId, items]) => {
      items.forEach((item) => {
        const matchName = item.n.toLowerCase().includes(query);
        const matchDesc = item.d.toLowerCase().includes(query);
        if (matchName || matchDesc) {
          results.push({
            ...item,
            catName: getCategoryName(catId),
          });
        }
      });
    });

    return results.slice(0, 50);
  }, [searchQuery]);

  // Услуги категории
  const categoryServices = useMemo(() => {
    if (!selectedCategory) return null;
    return CATALOG[selectedCategory] || [];
  }, [selectedCategory]);

  // Название категории
  const categoryName = useMemo(() => {
    if (!selectedCategory) return '';
    return CATEGORIES.find((c) => c.id === selectedCategory)?.name || '';
  }, [selectedCategory]);

  // Очистка поиска - передаём как callback
  const handleClear = useCallback(() => {
    // Это обработается в родительском компоненте
  }, []);

  // Поиск активен
  if (searchResults !== null) {
    if (searchResults.length === 0) {
      return <EmptyState message="Ничего не найдено" />;
    }

    return (
      <section>
        <SearchInfo count={searchResults.length} onClear={handleClear} />
        <div className="flex flex-col gap-2">
          {searchResults.map((service) => (
            <ServiceItem
              key={service.id}
              service={service}
              searchQuery={searchQuery}
              showCategory={true}
            />
          ))}
        </div>
      </section>
    );
  }

  // Категория не выбрана
  if (!selectedCategory) {
    return <EmptyState message="Выберите категорию выше" />;
  }

  // Показываем услуги категории
  return (
    <section>
      <header className="flex items-center justify-between mb-3">
        <h2 className="text-lg sm:text-xl font-extrabold">{categoryName}</h2>
        <span className="text-xs bg-muted px-3 py-1.5 rounded-full font-semibold">
          {categoryServices?.length || 0}{' '}
          {declOfNum(categoryServices?.length || 0, ['услуга', 'услуги', 'услуг'])}
        </span>
      </header>
      <div className="flex flex-col gap-2">
        {categoryServices?.map((service) => (
          <ServiceItem
            key={service.id}
            service={service}
            searchQuery=""
            showCategory={false}
          />
        ))}
      </div>
    </section>
  );
}
