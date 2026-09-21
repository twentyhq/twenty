import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { assertUnreachable } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { canActorSeeConnectedAccount } from 'src/engine/metadata-modules/connected-account/utils/can-actor-see-connected-account.util';
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
        authContext.application.universalIdentifier ===
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER ||
        canActorSeeConnectedAccount({ authContext, connectedAccount })
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
