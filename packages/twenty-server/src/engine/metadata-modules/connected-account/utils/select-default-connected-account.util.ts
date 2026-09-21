import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

export const selectDefaultConnectedAccount = <
  TConnectedAccount extends Pick<ConnectedAccountEntity, 'userWorkspaceId'>,
>({
  authContext,
  connectedAccounts,
}: {
  authContext: WorkspaceAuthContext;
  connectedAccounts: TConnectedAccount[];
}): TConnectedAccount | undefined => {
  const ownConnectedAccount =
    authContext.type === 'user'
      ? connectedAccounts.find(
          (connectedAccount) =>
            connectedAccount.userWorkspaceId === authContext.userWorkspaceId,
        )
      : undefined;

  return ownConnectedAccount ?? connectedAccounts[0];
};
