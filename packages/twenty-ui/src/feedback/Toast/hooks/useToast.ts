import { useMemo } from 'react';

import { useToastContext } from '../internal/useToastContext';

export const useToast = () => {
  const store = useToastContext();

  return useMemo(
    () => ({ enqueueToast: store.enqueueToast, close: store.close }),
    [store],
  );
};
