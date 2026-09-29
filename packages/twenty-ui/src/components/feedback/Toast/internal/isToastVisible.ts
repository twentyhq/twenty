import { type ToastEntry } from './ToastEntry';

export const isToastVisible = (toast: ToastEntry) => toast.status === 'visible';
