import { type Store } from 'jotai/vanilla/store';
import { createContext } from 'react';

export const ToastContext = createContext<Store | undefined>(undefined);
