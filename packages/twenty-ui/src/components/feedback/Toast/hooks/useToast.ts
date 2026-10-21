import { useCloseToast } from '../internal/hooks/useCloseToast';
import { useEnqueueToast } from '../internal/hooks/useEnqueueToast';
import { useUpdateToast } from '../internal/hooks/useUpdateToast';

export const useToast = () => {
  const { closeToast } = useCloseToast();
  const { enqueueToast } = useEnqueueToast();
  const { updateToast } = useUpdateToast();

  return { enqueueToast, closeToast, updateToast };
};
