import { type ReactNode } from 'react';

import { type ThemeOverrides } from './ThemeOverrides';
import { type ThemeType } from './themeTypes';

export type ThemeProviderProps = {
  children: ReactNode;
  colorScheme: 'light' | 'dark';
  applyToRoot?: boolean;
  overrides?: ThemeOverrides;
  className?: string;
  scale?: number;
  theme?: ThemeType;
};
