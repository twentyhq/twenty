import { createContext } from 'react';

import { type CountrySelectContextValue } from './CountrySelectContextValue';

export const CountrySelectContext = createContext<
  CountrySelectContextValue | undefined
>(undefined);
