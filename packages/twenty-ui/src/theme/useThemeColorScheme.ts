import React from 'react';

import { getThemeContext } from './internal/getThemeContext';

export const useThemeColorScheme = (): 'light' | 'dark' =>
  React.useContext(getThemeContext()).colorScheme;
