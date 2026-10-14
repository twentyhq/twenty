import { useCallback } from 'react';

import { type ToastUpdate } from '../../types/ToastUpdate';
import { updateToastInStore } from '../utils/updateToastInStore';
import { useToastContext } from './useToastContext';

export const useUpdateToast = () => {
  const store = useToastContext();
  const updateToast = useCallback(
    (changes: ToastUpdate) => updateToastInStore({ store, ...changes }),
    [store],
  );

  return { updateToast };
};
