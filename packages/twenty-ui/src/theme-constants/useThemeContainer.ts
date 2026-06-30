import { useContext } from 'react';

import { ThemeScopeContext } from './ThemeScopeContext';

export const useThemeContainer = (): HTMLElement | null =>
  useContext(ThemeScopeContext);
