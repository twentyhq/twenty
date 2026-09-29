import { createContext } from 'react';

import { type createToastStore } from './createToastStore';

export const ToastContext = createContext<
  ReturnType<typeof createToastStore> | undefined
>(undefined);
