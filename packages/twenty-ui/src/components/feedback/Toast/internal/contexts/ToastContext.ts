import { createContext } from 'react';

import { type createToastStore } from '../stores/createToastStore';

export const ToastContext = createContext<
  ReturnType<typeof createToastStore> | undefined
>(undefined);
