import { type ToastEntry } from '../types/ToastEntry';

export const isVisibleToast = (toast: ToastEntry) => toast.status === 'visible';
