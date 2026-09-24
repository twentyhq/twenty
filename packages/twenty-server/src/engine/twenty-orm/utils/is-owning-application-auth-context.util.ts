import { isDefined } from 'twenty-shared/utils';

import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export const isOwningApplicationAuthContext = ({
  authContext,
  owningApplicationId,
}: {
  authContext: WorkspaceAuthContext;
  owningApplicationId: string | undefined;
}): boolean =>
  isDefined(owningApplicationId) &&
  (isUserAuthContext(authContext) || isApplicationAuthContext(authContext)) &&
  authContext.application?.id === owningApplicationId;
