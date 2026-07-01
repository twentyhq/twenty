import { type PartnerScope } from './partner-scopes';

export const SCOPE_PRIORITY: PartnerScope[] = [
  'SOLUTIONING',
  'DEVELOPMENT',
  'ADVISORY',
  'HOSTING',
  'SUPPORT',
];

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
