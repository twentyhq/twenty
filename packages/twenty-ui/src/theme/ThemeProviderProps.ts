import { type ReactNode } from 'react';

import { type ThemeColor } from './constants/MainColorNames';
import { type THEME_LIGHT } from './constants/ThemeLight';
import { type ThemeOverrides } from './ThemeOverrides';
import { type ThemeType } from './themeTypes';

export type ThemeProviderProps = {
  children: ReactNode;
  colorScheme: 'light' | 'dark';
  accentColor?: ThemeColor;
  applyToRoot?: boolean;
  overrides?: ThemeOverrides;
  className?: string;
  scale?: number;
  theme?: ThemeType | typeof THEME_LIGHT;
};
