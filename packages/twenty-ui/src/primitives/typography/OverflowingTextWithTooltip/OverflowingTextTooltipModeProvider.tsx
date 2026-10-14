import { type ReactNode } from 'react';

import { OverflowingTextTooltipModeContext } from './internal/OverflowingTextTooltipModeContext';
import { type OverflowingTextTooltipMode } from './types/OverflowingTextTooltipMode';

export const OverflowingTextTooltipModeProvider = ({
  mode,
  children,
}: {
  mode: OverflowingTextTooltipMode;
  children: ReactNode;
}) => (
  <OverflowingTextTooltipModeContext.Provider value={mode}>
    {children}
  </OverflowingTextTooltipModeContext.Provider>
);
