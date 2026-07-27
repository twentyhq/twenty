import { type PartnerScope } from './partner-scopes';
import { SCOPE_PRIORITY } from './scope-priority-order';

export const topScopes = (scope: readonly PartnerScope[], n = 2) => {
  const sorted = scope.toSorted(
    (scopeA, scopeB) =>
      SCOPE_PRIORITY.indexOf(scopeA) - SCOPE_PRIORITY.indexOf(scopeB),
  );
  return {
    shown: sorted.slice(0, n),
    rest: Math.max(0, sorted.length - n),
  };
};
