import { type ToastOptions } from './ToastOptions';

export type ToastUpdate = Partial<Omit<ToastOptions, 'dedupeKey'>> & {
  id: string;
};
