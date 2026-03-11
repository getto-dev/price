'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, X, Smartphone, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useUserInteraction,
  usePWAStatus,
  safeLocalStorage,
} from '@/hooks/usePWA';

// Константы
const DISMISSAL_KEY = 'install-banner-dismissed';
const SYSTEM_DISMISSED_KEY = 'install-system-dismissed';
const DISMISSAL_DURATION_MS = 60 * 60 * 1000; // 1 час
const SHOW_DELAY_MS = 500;

// Тип для события beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Используем централизованные хуки
  const isInstalled = usePWAStatus();
  const hasInteracted = useUserInteraction();

  // Проверка таймера отклонения
  const checkDismissed = useCallback((key: string): boolean => {
    const dismissedAt = safeLocalStorage.getItem(key);
    if (!dismissedAt) return false;

    const timestamp = parseInt(dismissedAt, 10);
    if (isNaN(timestamp)) return false;

    return Date.now() - timestamp < DISMISSAL_DURATION_MS;
  }, []);

  // Обработчик beforeinstallprompt
  useEffect(() => {
    if (isInstalled) return;

    const handler = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;

      // Сохраняем событие всегда
      setDeferredPrompt(promptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isInstalled]);

  // Показать баннер после интеракции
  useEffect(() => {
    if (isInstalled || !hasInteracted || !deferredPrompt) return;
    if (checkDismissed(DISMISSAL_KEY) || checkDismissed(SYSTEM_DISMISSED_KEY)) return;

    const timer = setTimeout(() => setIsVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isInstalled, hasInteracted, deferredPrompt, checkDismissed]);

  // Установка приложения
  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsVisible(false);
      } else if (outcome === 'dismissed') {
        safeLocalStorage.setItem(SYSTEM_DISMISSED_KEY, Date.now().toString());
        setIsVisible(false);
      }
    } catch (error) {
      console.error('[InstallBanner] Install failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  // Закрытие баннера
  const handleDismiss = () => {
    setIsVisible(false);
    safeLocalStorage.setItem(DISMISSAL_KEY, Date.now().toString());
  };

  // Не показываем если уже установлен или не виден
  if (isInstalled || !isVisible) return null;

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
                Добавьте прайс-лист на домашний экран для быстрого доступа
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

          {/* Кнопка установки */}
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className={cn(
              "w-full mt-4 py-3 px-4 rounded-xl font-bold text-sm",
              "gradient-bg text-white",
              "flex items-center justify-center gap-2",
              "hover:opacity-90 active:scale-[0.98] transition-all",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "touch-manipulation"
            )}
            aria-busy={isInstalling}
          >
            {isInstalling ? (
              <>
                <Check className="w-5 h-5" />
                Установка...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Установить
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
