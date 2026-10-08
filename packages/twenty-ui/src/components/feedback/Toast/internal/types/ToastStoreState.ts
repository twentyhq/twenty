import { type ToastEntry } from './ToastEntry';

export type ToastStoreState = {
  toasts: ToastEntry[];
  limit: number;
  mountedToasterCount: number;
};
