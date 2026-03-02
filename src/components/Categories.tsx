'use client';

import { memo, useCallback } from 'react';
import { CATEGORIES } from '@/lib/catalog';
import { cn } from '@/lib/utils';

interface CategoriesProps {
  selectedCategory: string | null;
  onCategorySelect: (id: string | null) => void;
}

const basePath = process.env.NODE_ENV === 'production' ? '/price' : '';

const CategoryButton = memo(function CategoryButton({
  name,
  iconSrc,
  isActive,
  onClick,
}: {
  name: string;
  iconSrc: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all touch-manipulation',
        isActive
          ? 'gradient-bg border-transparent text-white'
          : 'bg-card border-border hover:border-primary hover:-translate-y-0.5'
      )}
      aria-pressed={isActive}
    >
      <img
        src={iconSrc}
        alt=""
        className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
        aria-hidden="true"
      />
      <span className={cn(
        "text-[10px] sm:text-[11px] font-bold text-center leading-tight line-clamp-2",
        isActive && "text-white"
      )}>
        {name}
      </span>
    </button>
  );
});

export function Categories({ selectedCategory, onCategorySelect }: CategoriesProps) {
  const handleCategoryClick = useCallback((id: string) => {
    onCategorySelect(selectedCategory === id ? null : id);
  }, [selectedCategory, onCategorySelect]);

  return (
    <section className="mb-5">
      <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5 px-1">
        Выберите категорию
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-1.5 sm:gap-2" role="listbox">
        {CATEGORIES.map((cat) => (
          <CategoryButton
            key={cat.id}
            name={cat.name}
            iconSrc={`${basePath}/icons/svg/${cat.id}.svg`}
            isActive={selectedCategory === cat.id}
            onClick={() => handleCategoryClick(cat.id)}
          />
        ))}
      </div>
    </section>
  );
}
