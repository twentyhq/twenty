import { Context, createContext } from 'react';

import { ComponentStateKey } from 'src/utilities/state/component-state/types/ComponentStateKey';

type ScopeInternalContext<T extends ComponentStateKey> = Context<T | null>;

export const createScopeInternalContext = <T extends ComponentStateKey>(
  initialValue?: T,
) => {
  return createContext<T | null>(
    initialValue ?? null,
  ) as ScopeInternalContext<T>;
};
