import { type ToastNotification } from '../../types/ToastNotification';

export type ToastEntry = {
  notification: ToastNotification;
  dedupeKey?: string;
  durationRevision?: number;
  status: 'visible' | 'closing';
};
