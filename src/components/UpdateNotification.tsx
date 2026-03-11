'use client';

import { RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UpdateNotificationProps {
  isVisible: boolean;
  onUpdate: () => void;
  onDismiss: () => void;
}

export function UpdateNotification({ isVisible, onUpdate, onDismiss }: UpdateNotificationProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top-4 duration-300">
      <div className="max-w-md mx-auto bg-card border-2 border-green-500/50 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4">
          <div className="flex items-center gap-3">
            {/* Иконка */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-white" />
            </div>

            {/* Контент */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm">Доступно обновление</h3>
              <p className="text-xs text-muted-foreground">
                Нажмите для обновления приложения
              </p>
            </div>

            {/* Кнопка закрытия */}
            <button
              onClick={onDismiss}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors touch-manipulation"
              aria-label="Закрыть"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Кнопка обновления */}
          <button
            onClick={onUpdate}
            className={cn(
              "w-full mt-3 py-2.5 px-4 rounded-xl font-bold text-sm",
              "bg-green-500 text-white",
              "flex items-center justify-center gap-2",
              "hover:bg-green-600 active:scale-[0.98] transition-all",
              "touch-manipulation"
            )}
          >
            <RefreshCw className="w-4 h-4" />
            Обновить
          </button>
        </div>
      </div>
    </div>
  );
}
