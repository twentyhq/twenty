import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

export const isConnectedAccountOwnedByViewer = ({
  connectedAccount,
  authContext,
}: {
  connectedAccount: Pick<
    ConnectedAccountEntity,
    'userWorkspaceId' | 'applicationId'
  >;
  authContext: WorkspaceAuthContext;
}): boolean => {
  if (isUserAuthContext(authContext)) {
    return connectedAccount.userWorkspaceId === authContext.userWorkspaceId;
  }

  // Email connections carry no applicationId, so an application only sees through channels it created itself
  if (isApplicationAuthContext(authContext)) {
    return connectedAccount.applicationId === authContext.application.id;
  }

  return false;
};
