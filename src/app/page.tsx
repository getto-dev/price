'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Categories } from '@/components/Categories';
import { Services } from '@/components/Services';
import { InstallBanner } from '@/components/InstallBanner';
import { IOSInstallBanner } from '@/components/IOSInstallBanner';
import { Footer } from '@/components/Footer';
import { UpdateNotification } from '@/components/UpdateNotification';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { isIOSSafari } from '@/hooks/usePWA';

// Типы для inline-уведомлений
type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  message: string;
  type: NotificationType;
}

// Время автоматического скрытия уведомления (мс)
const NOTIFICATION_AUTO_HIDE_MS = 3000;

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  const notificationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isChecking, isUpdateAvailable, checkForUpdates, applyUpdate } = useServiceWorker();

  // Определяем тип устройства для показа правильного баннера
  const showIOSBanner = useMemo(() => isIOSSafari(), []);

  // Показать inline-уведомление с автоматическим скрытием
  const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
    setNotification({ message, type });
    
    // Очищаем предыд таймер
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }
    
    // Автоматически скрываем через N секунд
    notificationTimerRef.current = setTimeout(() => setNotification(null), NOTIFICATION_AUTO_HIDE_MS);
  }, []);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);

  // Проверка обновлений с уведомлением
  const handleCheckUpdates = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      showNotification('Обновление не поддерживается вашим браузером', 'error');
      return;
    }

    try {
      const hasUpdate = await checkForUpdates();

      if (hasUpdate) {
        setShowUpdateNotification(true);
      } else {
        showNotification('Установлена последняя версия', 'success');
      }
    } catch {
      showNotification('Не удалось проверить обновления', 'error');
    }
  }, [checkForUpdates, showNotification]);

  // Применить обновление
  const handleApplyUpdate = useCallback(() => {
    applyUpdate();
    setShowUpdateNotification(false);
  }, [applyUpdate]);

  // Скрыть уведомление об обновлении
  const handleDismissUpdate = useCallback(() => {
    setShowUpdateNotification(false);
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

  // Очистка поиска (для Services компонента)
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-3 sm:py-4 safe-bottom flex-1">
        <Header
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onCheckUpdates={handleCheckUpdates}
          isCheckingUpdates={isChecking}
        />
        <Categories
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />
        <Services
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          onClearSearch={handleClearSearch}
        />
        <Footer />
      </main>

      {/* Inline-уведомления */}
      {notification && (
        <div
          className={`fixed top-4 left-4 right-4 z-[60] animate-in slide-in-from-top-4 duration-300 ${
            notification.type === 'success' ? 'text-green-600' :
            notification.type === 'error' ? 'text-red-600' : 'text-primary'
          }`}
        >
          <div className="max-w-md mx-auto bg-card border-2 rounded-xl shadow-lg p-4 text-center font-medium">
            {notification.message}
          </div>
        </div>
      )}

      {/* Уведомление об обновлении */}
      <UpdateNotification
        isVisible={showUpdateNotification || isUpdateAvailable}
        onUpdate={handleApplyUpdate}
        onDismiss={handleDismissUpdate}
      />

      {/* Баннеры установки PWA - взаимоисключающие */}
      {showIOSBanner ? <IOSInstallBanner /> : <InstallBanner />}
    </div>
  );
}
