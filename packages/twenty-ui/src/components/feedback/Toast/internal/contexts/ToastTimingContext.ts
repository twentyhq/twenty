import { createContext } from 'react';

export const ToastTimingContext = createContext({
  durationRevision: 0,
  isActive: true,
});
