import { isDefined } from 'twenty-shared/utils';

export type AuthenticatablePrincipalRequest = {
  user?: unknown;
  apiKey?: unknown;
  application?: unknown;
};

export const hasAuthenticatedPrincipal = (
  request: AuthenticatablePrincipalRequest,
): boolean =>
  isDefined(request.user) ||
  isDefined(request.apiKey) ||
  isDefined(request.application);
