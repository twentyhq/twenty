import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { isConnectedAccountUsableByCaller } from 'src/engine/metadata-modules/connected-account/utils/is-connected-account-usable-by-caller.util';

export const canActorActAsConnectedAccount = ({
  authContext,
  connectedAccount,
}: {
  authContext: WorkspaceAuthContext;
  connectedAccount: Pick<
    ConnectedAccountEntity,
    'visibility' | 'userWorkspaceId' | 'applicationId'
  >;
}): boolean => {
  switch (authContext.type) {
    case 'user':
      return isConnectedAccountUsableByCaller({
        connectedAccount,
        userWorkspaceId: authContext.userWorkspaceId,
      });
    case 'application':
      return (
        !isDefined(connectedAccount.applicationId) ||
        connectedAccount.applicationId === authContext.application.id
      );
    case 'apiKey':
    case 'system':
      return true;
    case 'pendingActivationUser':
      return false;
    default:
      return assertUnreachable(
        authContext,
        `Unhandled auth context type for connected account access`,
      );
  }
};
