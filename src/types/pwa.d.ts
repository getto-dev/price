/**
 * Типы для PWA функциональности
 */

// Расширение Navigator для iOS standalone режима
interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

// Событие beforeinstallprompt для PWA установки
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Глобальное расширение Window
declare global {
  interface Window {
    navigator: NavigatorWithStandalone;
  }
}

export { NavigatorWithStandalone, BeforeInstallPromptEvent };
