import { useMemo } from 'react';

import { useCloseToast } from './useCloseToast';
import { useEnqueueToast } from './useEnqueueToast';

export const useToast = () => {
  const { closeToast } = useCloseToast();
  const { enqueueToast } = useEnqueueToast();

  return useMemo(
    () => ({ enqueueToast, closeToast }),
    [enqueueToast, closeToast],
  );
};
