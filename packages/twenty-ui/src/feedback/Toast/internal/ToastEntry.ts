import { type ToastNotification } from '../types/ToastNotification';

export type ToastEntry = {
  notification: ToastNotification;
  status: 'visible' | 'closing';
};
