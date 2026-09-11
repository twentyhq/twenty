import { atom } from 'jotai';

import { DEFAULT_TOAST_LIMIT } from '../constants/DefaultToastLimit';
import { type ToastState } from '../types/ToastState';
import { isVisibleToast } from '../utils/isVisibleToast';

export const toastState = atom<ToastState>({
  toasts: [],
  nextRenderKey: 0,
  limit: DEFAULT_TOAST_LIMIT,
  isToasterMounted: false,
});

toastState.debugLabel = 'toastState';

// Only mounted viewports subscribe; without one, exit animations cannot finish.
toastState.onMount = (setState) => {
  setState((state) => ({ ...state, isToasterMounted: true }));

  return () => {
    setState((state) => ({
      ...state,
      isToasterMounted: false,
      toasts: state.toasts.filter(isVisibleToast),
    }));
  };
};
