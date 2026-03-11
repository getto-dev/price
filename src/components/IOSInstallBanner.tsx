'use client';

import { useState, useEffect, useCallback } from 'react';
import { Share, PlusSquare, Home, X, ChevronDown, ChevronUp, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useUserInteraction,
  safeLocalStorage,
  isIOSSafari,
} from '@/hooks/usePWA';

// Константы
const IOS_DISMISSAL_KEY = 'ios-install-banner-dismissed';
const DISMISSAL_DURATION_MS = 60 * 60 * 1000; // 1 час
const SHOW_DELAY_MS = 500;

export function IOSInstallBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Используем централизованные хуки
  const hasInteracted = useUserInteraction();

  // Проверка таймера отклонения
  const checkDismissed = useCallback((): boolean => {
    const dismissedAt = safeLocalStorage.getItem(IOS_DISMISSAL_KEY);
    if (!dismissedAt) return false;

    const timestamp = parseInt(dismissedAt, 10);
    if (isNaN(timestamp)) return false;

    return Date.now() - timestamp < DISMISSAL_DURATION_MS;
  }, []);

  // Показать баннер после интеракции
  useEffect(() => {
    // Проверяем iOS Safari при каждом эффекте
    if (!isIOSSafari() || checkDismissed()) return;

    if (hasInteracted) {
      const timer = setTimeout(() => setIsVisible(true), SHOW_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [hasInteracted, checkDismissed]);

  // Закрытие баннера
  const handleDismiss = () => {
    setIsVisible(false);
    safeLocalStorage.setItem(IOS_DISMISSAL_KEY, Date.now().toString());
  };

  // Переключение инструкции
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="max-w-md mx-auto bg-card border-2 border-primary/30 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Иконка */}
            <div className="flex-shrink-0 w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>

            {/* Контент */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base mb-1">Установить приложение</h3>
              <p className="text-sm text-muted-foreground">
                Добавьте прайс-лист на домашний экран
              </p>
            </div>

            {/* Кнопка закрытия */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors touch-manipulation"
              aria-label="Закрыть баннер установки"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Кнопка "Как установить?" */}
          <button
            onClick={toggleExpand}
            className={cn(
              "w-full mt-4 py-3 px-4 rounded-xl font-bold text-sm",
              "bg-primary/10 text-primary border-2 border-primary/20",
              "flex items-center justify-center gap-2",
              "hover:bg-primary/20 active:scale-[0.98] transition-all",
              "touch-manipulation"
            )}
            aria-expanded={isExpanded}
            aria-controls="ios-install-instructions"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-5 h-5" />
                Скрыть инструкцию
              </>
            ) : (
              <>
                <ChevronDown className="w-5 h-5" />
                Как установить?
              </>
            )}
          </button>

          {/* Пошаговая инструкция */}
          {isExpanded && (
            <div id="ios-install-instructions" className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
              {/* Шаг 1 */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <Share className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-blue-500 mb-0.5">Шаг 1</div>
                  <div className="text-sm font-medium">Нажмите кнопку «Поделиться»</div>
                  <div className="text-xs text-muted-foreground">в нижней части экрана</div>
                </div>
              </div>

              {/* Шаг 2 */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <PlusSquare className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-green-500 mb-0.5">Шаг 2</div>
                  <div className="text-sm font-medium">Выберите «На экран Домой»</div>
                  <div className="text-xs text-muted-foreground">в меню действий</div>
                </div>
              </div>

              {/* Шаг 3 */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-purple-500 mb-0.5">Шаг 3</div>
                  <div className="text-sm font-medium">Нажмите «Добавить»</div>
                  <div className="text-xs text-muted-foreground">в правом верхнем углу</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
