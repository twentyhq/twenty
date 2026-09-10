import { createContext } from 'react';

import { type ToastStore } from './ToastStore';

export const ToastContext = createContext<ToastStore | undefined>(undefined);
