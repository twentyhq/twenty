import { type ToastProps } from './ToastProps';

export type ToastOptions = Omit<ToastProps, 'ref' | 'id'> & {
  dedupeKey?: string;
};
