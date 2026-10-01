import { type ToastOptions } from './ToastOptions';

export type ToastNotification = Omit<ToastOptions, 'dedupeKey'> & {
  id: string;
};
