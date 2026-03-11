import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Базовый путь для GitHub Pages
export const basePath = process.env.NODE_ENV === 'production' ? '/price' : '';
