'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Безопасная работа с localStorage
 * Обрабатывает ошибки приватного режима Safari
 */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch {
      // Приватный режим Safari или localStorage недоступен
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // Игнорируем ошибки приватного режима
    }
  },

  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Игнорируем ошибки
    }
  },
};

/**
 * Проверка, запущено ли приложение в standalone режиме (PWA)
 */
export function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;

  return window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator && (window.navigator as Navigator & { standalone?: boolean }).standalone === true);
}

/**
 * Хук для отслеживания первой интеракции пользователя
 * Возвращает true после первого scroll, click или touchstart
 */
export function useUserInteraction(): boolean {
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (hasInteracted) return;

    const handleInteraction = () => setHasInteracted(true);

    window.addEventListener('scroll', handleInteraction, { once: true, passive: true });
    window.addEventListener('click', handleInteraction, { once: true, passive: true });
    window.addEventListener('touchstart', handleInteraction, { once: true, passive: true });

    return () => {
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [hasInteracted]);

  return hasInteracted;
}

/**
 * Хук для таймера отклонения
 * Проверяет, был ли отклонён баннер в течение указанного периода
 */
export function useDismissalTimer(key: string, durationMs: number): {
  isDismissed: boolean;
  dismiss: () => void;
} {
  const checkDismissed = useCallback(() => {
    const dismissedAt = safeLocalStorage.getItem(key);
    if (!dismissedAt) return false;

    const timestamp = parseInt(dismissedAt, 10);
    if (isNaN(timestamp)) return false;

    return Date.now() - timestamp < durationMs;
  }, [key, durationMs]);

  const [isDismissed, setIsDismissed] = useState(checkDismissed);

  const dismiss = useCallback(() => {
    safeLocalStorage.setItem(key, Date.now().toString());
    setIsDismissed(true);
  }, [key]);

  return { isDismissed, dismiss };
}

/**
 * Хук для проверки PWA статуса
 * Возвращает true, если приложение запущено в standalone режиме
 */
export function usePWAStatus(): boolean {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const checkPWA = () => setIsPWA(isStandaloneMode());

    checkPWA();

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkPWA);

    return () => mediaQuery.removeEventListener('change', checkPWA);
  }, []);

  return isPWA;
}

/**
 * Проверка iOS Safari (включая iPadOS 13+)
 * Возвращает true только для Safari на iPhone/iPad в браузерном режиме
 */
export function isIOSSafari(): boolean {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent;

  // iPhone, iPod
  const isIPhoneOrIPod = /iPhone|iPod/.test(userAgent);

  // iPad: классический и iPadOS 13+ (выглядит как macOS)
  const isIPad = /iPad/.test(userAgent) ||
    (/Macintosh/.test(userAgent) && navigator.maxTouchPoints > 0);

  // Проверка Safari (исключаем Chrome, Firefox, Edge на iOS)
  const isSafari = /Safari/.test(userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(userAgent);

  // Проверка standalone режима - если уже установлен, не показываем баннер
  const isStandalone = isStandaloneMode();

  return (isIPhoneOrIPod || isIPad) && isSafari && !isStandalone;
}

/**
 * Проверка, является ли устройство iOS (iPhone/iPad)
 */
export function isIOSDevice(): boolean {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent;

  const isIPhoneOrIPod = /iPhone|iPod/.test(userAgent);
  const isIPad = /iPad/.test(userAgent) ||
    (/Macintosh/.test(userAgent) && navigator.maxTouchPoints > 0);

  return isIPhoneOrIPod || isIPad;
}
