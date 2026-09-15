import { atom } from 'jotai';

import { DEFAULT_TOAST_LIMIT } from '../constants/DefaultToastLimit';

export const toastLimitState = atom(DEFAULT_TOAST_LIMIT);

toastLimitState.debugLabel = 'toastLimitState';
