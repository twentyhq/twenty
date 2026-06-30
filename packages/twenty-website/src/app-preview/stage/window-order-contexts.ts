'use client';

import { createContext } from 'react';

type WindowOrderApi = {
  register: (id: string) => void;
  unregister: (id: string) => void;
  activate: (id: string) => void;
};

// Split contexts: activations re-render only stack consumers.
export const WINDOW_ORDER_CONTEXTS = {
  api: createContext<WindowOrderApi | null>(null),
  stack: createContext<ReadonlyArray<string>>([]),
};
