import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

// The single definition of who may compose from an account: its owner, or anyone when it is shared with the workspace.
export const isConnectedAccountUsableByCaller = ({
  connectedAccount,
  userWorkspaceId,
}: {
  connectedAccount: Pick<
    ConnectedAccountEntity,
    'visibility' | 'userWorkspaceId'
  >;
  userWorkspaceId: string;
}): boolean =>
  connectedAccount.visibility === 'workspace' ||
  connectedAccount.userWorkspaceId === userWorkspaceId;
