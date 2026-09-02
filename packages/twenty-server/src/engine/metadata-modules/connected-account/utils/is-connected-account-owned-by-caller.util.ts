import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

// "May use" and "may destroy" are different permissions: a workspace-shared
// account is usable by every member (sending as a shared mailbox), but only
// its owner may manage or delete it.
export const isConnectedAccountOwnedByCaller = ({
  connectedAccount,
  userWorkspaceId,
}: {
  connectedAccount: Pick<ConnectedAccountEntity, 'userWorkspaceId'>;
  userWorkspaceId: string;
}): boolean => connectedAccount.userWorkspaceId === userWorkspaceId;
