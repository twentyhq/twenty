import { CONNECTION_PROVIDER_SCOPES } from '@/application/constants/ConnectionProviderScopes';
import { type ConnectionProviderScope } from '@/application/connectionProviderScopeType';

export const isConnectionProviderScope = (
  scope: string,
): scope is ConnectionProviderScope =>
  (CONNECTION_PROVIDER_SCOPES as readonly string[]).includes(scope);
