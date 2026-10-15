import { createContext } from 'react';

import { type OverflowingTextTooltipMode } from '../types/OverflowingTextTooltipMode';

export const OverflowingTextTooltipModeContext =
  createContext<OverflowingTextTooltipMode>('measure-on-hover');
