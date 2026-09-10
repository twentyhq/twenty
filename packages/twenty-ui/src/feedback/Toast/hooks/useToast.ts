import { useMemo } from 'react';

import { useToastContext } from '../internal/useToastContext';

export const useToast = () => {
  const store = useToastContext();

  return useMemo(() => ({ add: store.add, close: store.close }), [store]);
};
