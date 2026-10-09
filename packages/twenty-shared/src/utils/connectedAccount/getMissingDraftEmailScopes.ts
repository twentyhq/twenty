import { GMAIL_COMPOSE_SCOPE } from '@/constants';
import { ConnectedAccountProvider } from '@/types';
import { getConnectedAccountPermissionScopes } from '@/utils/connectedAccount/getConnectedAccountPermissionScopes';

export const getMissingDraftEmailScopes = (connectedAccount: {
  provider: ConnectedAccountProvider;
  scopes: string[] | null;
}): string[] => {
  const grantedScopes = connectedAccount.scopes ?? [];

  // Gmail drafts need gmail.compose only: gmail.send, the other Google scope
  // of the send permission, cannot create drafts.
  const requiredScopes =
    connectedAccount.provider === ConnectedAccountProvider.GOOGLE
      ? [GMAIL_COMPOSE_SCOPE]
      : getConnectedAccountPermissionScopes({
          permission: 'SEND_EMAILS',
          provider: connectedAccount.provider,
        });

  return requiredScopes.filter((scope) => !grantedScopes.includes(scope));
};
