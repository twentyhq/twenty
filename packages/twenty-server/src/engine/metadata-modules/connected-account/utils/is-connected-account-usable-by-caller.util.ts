import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

export const isConnectedAccountUsableByCaller = ({
  connectedAccount,
  userWorkspaceId,
}: {
  connectedAccount: Pick<ConnectedAccountEntity, 'scope' | 'userWorkspaceId'>;
  userWorkspaceId: string;
}): boolean =>
  connectedAccount.scope === 'WORKSPACE' ||
  connectedAccount.userWorkspaceId === userWorkspaceId;
