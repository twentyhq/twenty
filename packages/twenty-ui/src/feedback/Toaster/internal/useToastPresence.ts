import { useCallback, useState } from 'react';

import { type ToastNotification } from '@ui/feedback/Toast/types/ToastNotification';

export const useToastPresence = (toasts: ToastNotification[]) => {
  const [state, setState] = useState({ toasts, renderedToasts: toasts });

  if (state.toasts !== toasts) {
    const renderedToasts = [...toasts];

    state.renderedToasts.forEach((toast, index) => {
      if (!toasts.some((currentToast) => currentToast.id === toast.id)) {
        renderedToasts.splice(index, 0, toast);
      }
    });

    setState({ toasts, renderedToasts });
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
