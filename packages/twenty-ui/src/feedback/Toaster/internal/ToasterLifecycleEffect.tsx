import { useLayoutEffect } from 'react';

import { useToastContext } from '@ui/feedback/Toast/hooks/useToastContext';
import { mountedToasterCountState } from '@ui/feedback/Toast/states/mountedToasterCountState';
import { toastsState } from '@ui/feedback/Toast/states/toastsState';
import { isVisibleToast } from '@ui/feedback/Toast/utils/isVisibleToast';

export const ToasterLifecycleEffect = () => {
  const store = useToastContext();

  useLayoutEffect(() => {
    store.set(mountedToasterCountState, (count) => count + 1);

    return () => {
      store.set(mountedToasterCountState, (count) => count - 1);

      if (store.get(mountedToasterCountState) > 0) {
        return;
      }

      store.set(toastsState, (toasts) => toasts.filter(isVisibleToast));
    };
  }, [store]);

  return null;
};
