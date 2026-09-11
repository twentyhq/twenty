import { type ToastEntry } from './ToastEntry';

export type ToastState = {
  toasts: ToastEntry[];
  nextRenderKey: number;
  limit: number;
  isToasterMounted: boolean;
};
