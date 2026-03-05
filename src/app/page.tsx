'use client';

import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Categories } from '@/components/Categories';
import { Services } from '@/components/Services';

const CURRENT_VERSION = '2.0';

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Проверка обновлений
  const handleCheckUpdates = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      alert('Обновление не поддерживается');
      return;
    }

    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.update();

      setTimeout(() => {
        if (!reg.installing && !reg.waiting) {
          alert('Обновлений нет');
        }
      }, 1500);
    } catch {
      alert('Ошибка проверки');
    }
  }, []);

  // Очистка поиска при выборе категории
  const handleCategorySelect = useCallback((id: string | null) => {
    setSelectedCategory(id);
    if (id) setSearchQuery('');
  }, []);

  // Очистка категории при поиске
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) setSelectedCategory(null);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-4 py-3 sm:py-4 safe-bottom">
        <Header
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onCheckUpdates={handleCheckUpdates}
        />
        <Categories
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />
        <Services
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
        />
      </main>
      <footer className="text-center py-4 text-[10px] sm:text-[11px] text-muted-foreground/60">
        Getto-Dev v{CURRENT_VERSION} • 2026
      </footer>
    </div>
  );
}
