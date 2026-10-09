import { type ConnectedAccountProvider } from '@/types';
import { getConnectedAccountPermissionScopes } from '@/utils/connectedAccount/getConnectedAccountPermissionScopes';

export const getMissingCreateEventScopes = (connectedAccount: {
  provider: ConnectedAccountProvider;
  scopes: string[] | null;
}): string[] => {
  const grantedScopes = connectedAccount.scopes ?? [];

  return getConnectedAccountPermissionScopes({
    permission: 'MANAGE_EVENTS',
    provider: connectedAccount.provider,
  }).filter((scope) => !grantedScopes.includes(scope));
};
