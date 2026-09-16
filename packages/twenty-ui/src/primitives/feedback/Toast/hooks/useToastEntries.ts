import { useStore } from '@base-ui/utils/store';

import { useToastContext } from './useToastContext';

export const useToastEntries = () => {
  const store = useToastContext();

  return useStore(store, (state) => state.toasts);
};
