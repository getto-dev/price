'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Константы
const SW_UPDATE_TIMEOUT_MS = 1000;
const SW_READY_TIMEOUT_MS = 5000;

interface ServiceWorkerUpdate {
  isChecking: boolean;
  isUpdateAvailable: boolean;
  checkForUpdates: () => Promise<boolean>;
  applyUpdate: () => void;
}

/**
 * Таймаут для Promise
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export function useServiceWorker(): ServiceWorkerUpdate {
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  // Обработка обновления SW - перезагрузка при активации нового
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleControllerChange = () => window.location.reload();
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
  }, []);

  // Регистрация и отслеживание SW
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready
      .then((reg) => {
        registrationRef.current = reg;

        // Проверяем наличие waiting SW при загрузке
        if (reg.waiting) {
          setIsUpdateAvailable(true);
          return;
        }

        // Отслеживаем установку нового SW
        const handleUpdateFound = () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          const handleStateChange = () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setIsUpdateAvailable(true);
            }
          };

          newWorker.addEventListener('statechange', handleStateChange);
        };

        reg.addEventListener('updatefound', handleUpdateFound);
      })
      .catch((error) => {
        // Ошибка при получении SW регистрации (например, в приватном режиме)
        console.warn('[useServiceWorker] SW not available:', error.message);
      });
  }, []);

  // Проверка обновлений
  const checkForUpdates = useCallback(async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    setIsChecking(true);

    try {
      // Получаем регистрацию с таймаутом
      const reg = await withTimeout(
        navigator.serviceWorker.ready,
        SW_READY_TIMEOUT_MS
      );
      registrationRef.current = reg;

      // Уже есть waiting SW
      if (reg.waiting) {
        setIsUpdateAvailable(true);
        setIsChecking(false);
        return true;
      }

      // Запускаем проверку обновлений
      await reg.update();

      // Проверяем сразу после update
      if (reg.waiting) {
        setIsUpdateAvailable(true);
        setIsChecking(false);
        return true;
      }

      // Ждём немного для updatefound события
      await new Promise((resolve) => setTimeout(resolve, SW_UPDATE_TIMEOUT_MS));

      const hasUpdate = !!reg.waiting;
      if (hasUpdate) setIsUpdateAvailable(true);

      setIsChecking(false);
      return hasUpdate;
    } catch (error) {
      // Ошибка проверки (таймаут или другая проблема)
      console.warn('[useServiceWorker] Check updates failed:', error instanceof Error ? error.message : error);
      setIsChecking(false);
      return false;
    }
  }, []);

  // Применить обновление
  const applyUpdate = useCallback(() => {
    registrationRef.current?.waiting?.postMessage({ type: 'SKIP_WAITING' });
  }, []);

  return { isChecking, isUpdateAvailable, checkForUpdates, applyUpdate };
}
