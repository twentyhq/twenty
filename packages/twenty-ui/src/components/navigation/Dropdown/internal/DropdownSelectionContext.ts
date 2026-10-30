import { createContext } from 'react';

import { type DropdownSelectionContextValue } from './DropdownSelectionContextValue';

export const DropdownSelectionContext = createContext<
  DropdownSelectionContextValue | undefined
>(undefined);
