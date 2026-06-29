'use client';

import { createContext } from 'react';

import { type Scheme } from '@/tokens';

export type MenuStyleOverride = {
  scheme?: Scheme;
  suppressElevation?: boolean;
};

type MenuStyleContextValue = {
  activeScheme: Scheme | null;
  override: MenuStyleOverride;
  setBackground: (value: string | null) => void;
  setOverride: (override: MenuStyleOverride) => void;
};

export const MenuStyleContext = createContext<MenuStyleContextValue | null>(
  null,
);
