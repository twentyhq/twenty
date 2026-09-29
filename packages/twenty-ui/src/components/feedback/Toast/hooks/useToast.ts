import { useCloseToast } from '../internal/useCloseToast';
import { useEnqueueToast } from '../internal/useEnqueueToast';

export const useToast = () => {
  const { closeToast } = useCloseToast();
  const { enqueueToast } = useEnqueueToast();

  return { enqueueToast, closeToast };
};
