import { type ToastNotification } from './ToastNotification';

export type ToastEntry = {
  notification: ToastNotification;
  status: 'visible' | 'closing';
  renderKey: number;
};
