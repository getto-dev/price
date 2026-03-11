'use client';

import { useState, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCheckUpdates: () => void;
  isCheckingUpdates?: boolean;
}

export function Header({ searchQuery, onSearchChange, onCheckUpdates, isCheckingUpdates = false }: HeaderProps) {
  const [showClear, setShowClear] = useState(false);

  // Отображаем/скрываем кнопку при наличии текста
  const handleSearch = useCallback((value: string) => {
    onSearchChange(value);
    setShowClear(value.length > 0);
  }, [onSearchChange]);

  const handleClear = useCallback(() => {
    onSearchChange('');
    setShowClear(false);
  }, [onSearchChange]);

  return (
    <header className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-primary/50 flex-wrap">
      {/* Logo / Check Updates Button */}
      <button
        onClick={onCheckUpdates}
        disabled={isCheckingUpdates}
        className={cn(
          "text-lg sm:text-xl font-extrabold whitespace-nowrap transition-opacity touch-manipulation",
          isCheckingUpdates ? "opacity-50 cursor-wait" : "gradient-text cursor-pointer hover:opacity-80"
        )}
        aria-label="Проверить обновления приложения"
        aria-busy={isCheckingUpdates}
        aria-live="polite"
      >
        {isCheckingUpdates ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            Прайс-лист
          </span>
        ) : (
          'Прайс-лист'
        )}
      </button>

      {/* Search */}
      <div className="flex-1 min-w-[180px] relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Поиск услуг..."
          className={cn(
            'w-full pl-10 pr-10 py-2.5 rounded-xl text-sm font-medium',
            'bg-card border-2 border-border',
            'focus:outline-none focus:border-primary focus:shadow-lg focus:shadow-primary/25',
            'transition-all touch-manipulation'
          )}
          aria-label="Поиск услуг"
          aria-describedby="search-hint"
        />
        <span id="search-hint" className="sr-only">
          Введите минимум 2 символа для поиска
        </span>
        {showClear && (
          <button
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-muted-foreground text-white hover:bg-accent active:scale-90 transition-all touch-manipulation"
            aria-label="Очистить поиск"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
    </header>
  );
}
