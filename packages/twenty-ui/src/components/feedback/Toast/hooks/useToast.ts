import { useCloseToast } from '../internal/hooks/useCloseToast';
import { useEnqueueToast } from '../internal/hooks/useEnqueueToast';

export const useToast = () => {
  const { closeToast } = useCloseToast();
  const { enqueueToast } = useEnqueueToast();

  return { enqueueToast, closeToast };
};
