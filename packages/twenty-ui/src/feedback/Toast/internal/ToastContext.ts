import { createContext } from 'react';

import { type createToastStore } from './createToastStore';

export const ToastContext = createContext<
  { store: ReturnType<typeof createToastStore>; limit: number } | undefined
>(undefined);
