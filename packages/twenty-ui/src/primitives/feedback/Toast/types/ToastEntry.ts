import { type ToastNotification } from './ToastNotification';

export type ToastEntry = {
  notification: ToastNotification;
  dedupeKey?: string;
  status: 'visible' | 'closing';
};
