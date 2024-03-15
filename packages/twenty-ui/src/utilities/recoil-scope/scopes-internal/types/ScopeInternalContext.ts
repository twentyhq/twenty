import { Context } from 'react';

export type ScopeInternalContext<T extends { scopeId: string }> =
  Context<T | null>;
