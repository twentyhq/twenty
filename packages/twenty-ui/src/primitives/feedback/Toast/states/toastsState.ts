import { atom } from 'jotai';

import { type ToastEntry } from '../types/ToastEntry';

export const toastsState = atom<ToastEntry[]>([]);

toastsState.debugLabel = 'toastsState';
