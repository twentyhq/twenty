import React from 'react';

import { getThemeScopeContext } from './internal/getThemeScopeContext';

export const useThemeContainer = (): HTMLElement | null =>
  React.useContext(getThemeScopeContext());
