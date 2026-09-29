import { type ToastNotification } from '../types/ToastNotification';

export type ToastEntry = {
  notification: ToastNotification;
  dedupeKey?: string;
  status: 'visible' | 'closing';
};
