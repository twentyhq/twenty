import { useContext } from 'react';

import { ScopeInternalContext } from '../types/ScopeInternalContext';

export const useScopeInternalContext = <T extends { scopeId: string }>(
  Context: ScopeInternalContext<T>,
) => {
  const context = useContext(Context);

  return context;
};
