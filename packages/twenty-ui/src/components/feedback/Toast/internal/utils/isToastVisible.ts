import { type ToastEntry } from '../types/ToastEntry';

export const isToastVisible = (toast: ToastEntry) => toast.status === 'visible';
