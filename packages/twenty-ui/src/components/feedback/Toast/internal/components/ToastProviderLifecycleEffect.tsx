import { useEffect, useLayoutEffect } from 'react';

import { useToastContext } from '../hooks/useToastContext';
import { updateToastLimit } from '../utils/updateToastLimit';

export const ToastProviderLifecycleEffect = ({ limit }: { limit: number }) => {
  const store = useToastContext();

  useEffect(() => store.lifecycle.mount(), [store]);
  useLayoutEffect(() => updateToastLimit({ store, limit }), [store, limit]);

  return null;
};
