/* @license Enterprise */

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export const canAuthContextHoldRoles = (
  authContext: Pick<WorkspaceAuthContext, 'type'>,
): boolean =>
  authContext.type !== 'system' && authContext.type !== 'pendingActivationUser';
