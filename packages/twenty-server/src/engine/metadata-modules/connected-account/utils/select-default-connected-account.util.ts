import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

export const selectDefaultConnectedAccount = <
  TConnectedAccount extends Pick<ConnectedAccountEntity, 'userWorkspaceId'>,
>({
  authContext,
  initiatorUserWorkspaceId,
  connectedAccounts,
}: {
  authContext: WorkspaceAuthContext;
  initiatorUserWorkspaceId?: string;
  connectedAccounts: TConnectedAccount[];
}): TConnectedAccount | undefined => {
  const preferredUserWorkspaceId =
    initiatorUserWorkspaceId ??
    (authContext.type === 'user' ? authContext.userWorkspaceId : undefined);

  const ownConnectedAccount = isDefined(preferredUserWorkspaceId)
    ? connectedAccounts.find(
        (connectedAccount) =>
          connectedAccount.userWorkspaceId === preferredUserWorkspaceId,
      )
    : undefined;

  return ownConnectedAccount ?? connectedAccounts[0];
};
