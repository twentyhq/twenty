import { useLayoutEffect } from 'react';

import { useToastContext } from '@ui/components/feedback/Toast/hooks/useToastContext';
import { isToastVisible } from '@ui/components/feedback/Toast/utils/isToastVisible';

export const ToasterLifecycleEffect = () => {
  const store = useToastContext();

  useLayoutEffect(() => {
    store.set('mountedToasterCount', store.state.mountedToasterCount + 1);

    return () => {
      store.set('mountedToasterCount', store.state.mountedToasterCount - 1);

      if (store.state.mountedToasterCount > 0) {
        return;
      }

      store.set('toasts', store.state.toasts.filter(isToastVisible));
    };
  }, [store]);

  return null;
};
