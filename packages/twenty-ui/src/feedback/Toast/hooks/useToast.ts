import { useMemo } from 'react';

import { useCloseToast } from './useCloseToast';
import { useEnqueueToast } from './useEnqueueToast';

export const useToast = () => {
  const { close } = useCloseToast();
  const { enqueueToast } = useEnqueueToast();

  return useMemo(() => ({ enqueueToast, close }), [enqueueToast, close]);
};
