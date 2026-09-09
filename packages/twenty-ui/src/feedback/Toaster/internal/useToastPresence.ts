import { useCallback, useState } from 'react';

import { type ToastNotification } from '@ui/feedback/Toast/types/ToastNotification';

export const useToastPresence = (toasts: ToastNotification[]) => {
  const [state, setState] = useState({ toasts, renderedToasts: toasts });

  if (state.toasts !== toasts) {
    setState({
      toasts,
      renderedToasts: [
        ...state.renderedToasts.map(
          (renderedToast) =>
            toasts.find((toast) => toast.id === renderedToast.id) ??
            renderedToast,
        ),
        ...toasts.filter(
          (toast) =>
            !state.renderedToasts.some(
              (renderedToast) => renderedToast.id === toast.id,
            ),
        ),
      ],
    });
  }

  const handleExitComplete = useCallback((id: string) => {
    setState((current) => {
      if (current.toasts.some((toast) => toast.id === id)) {
        return current;
      }

      return {
        ...current,
        renderedToasts: current.renderedToasts.filter(
          (toast) => toast.id !== id,
        ),
      };
    });
  }, []);

  return { renderedToasts: state.renderedToasts, handleExitComplete };
};
