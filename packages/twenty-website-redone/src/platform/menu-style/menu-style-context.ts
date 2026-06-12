'use client';

import { createContext } from 'react';

import { type Scheme } from '@/tokens';

// Discrete restyles a page may apply to the sticky Menu. Continuous
// values (the scroll-interpolated background) travel as a CSS custom
// property instead — see MENU_STYLE_BACKGROUND_VAR — so no React work
// happens per scroll frame.
export type MenuStyleOverride = {
  scheme?: Scheme;
  suppressBackdropBlur?: boolean;
  suppressElevation?: boolean;
};

type MenuStyleContextValue = {
  override: MenuStyleOverride;
  setBackground: (value: string | null) => void;
  setOverride: (override: MenuStyleOverride) => void;
};

export const MenuStyleContext = createContext<MenuStyleContextValue | null>(
  null,
);
