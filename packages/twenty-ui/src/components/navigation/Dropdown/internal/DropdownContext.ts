import { createContext } from 'react';

import { type DropdownContextValue } from './DropdownContextValue';

export const DropdownContext = createContext<DropdownContextValue | undefined>(
  undefined,
);
