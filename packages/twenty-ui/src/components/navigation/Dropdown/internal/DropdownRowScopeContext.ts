import { createContext } from 'react';

import { type DropdownRowScope } from './DropdownRowScope';

export const DropdownRowScopeContext = createContext<
  DropdownRowScope | undefined
>(undefined);
