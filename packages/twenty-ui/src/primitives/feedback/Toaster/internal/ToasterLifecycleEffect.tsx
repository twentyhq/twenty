import { useLayoutEffect } from 'react';

import { useToastContext } from '@ui/primitives/feedback/Toast/hooks/useToastContext';
import { mountedToasterCountState } from '@ui/primitives/feedback/Toast/states/mountedToasterCountState';
import { toastsState } from '@ui/primitives/feedback/Toast/states/toastsState';
import { isToastVisible } from '@ui/primitives/feedback/Toast/utils/isToastVisible';

export const ToasterLifecycleEffect = () => {
  const store = useToastContext();

  useLayoutEffect(() => {
    store.set(mountedToasterCountState, (count) => count + 1);

    return () => {
      store.set(mountedToasterCountState, (count) => count - 1);

      if (store.get(mountedToasterCountState) > 0) {
        return;
      }

      store.set(toastsState, (toasts) => toasts.filter(isToastVisible));
    };
  }, [store]);

  return null;
};
