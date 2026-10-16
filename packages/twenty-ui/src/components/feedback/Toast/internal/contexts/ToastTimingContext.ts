import { createContext } from 'react';

import { type createToastLifecycle } from '../utils/createToastLifecycle';

type ToastTiming = {
  durationRevision: number;
  isActive: boolean;
  lifecycle?: ReturnType<typeof createToastLifecycle>;
  id?: string;
  rendererKey?: symbol;
  timingOverrides?: { duration?: number; progress?: number };
};

export const ToastTimingContext = createContext<ToastTiming>({
  durationRevision: 0,
  isActive: true,
});
