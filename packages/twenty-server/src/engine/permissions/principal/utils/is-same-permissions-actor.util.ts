/* @license Enterprise */

import { type PermissionsAuthContext } from 'src/engine/permissions/principal/types/permissions-auth-context.type';

const getActorId = (
  authContext: PermissionsAuthContext,
): string | undefined => {
  switch (authContext.type) {
    case 'user':
      return authContext.workspaceMemberId;
    case 'apiKey':
      return authContext.apiKey.id;
    case 'application':
      return authContext.application.id;
    case 'webhook':
      return authContext.webhook.id;
    case 'system':
    case 'pendingActivationUser':
      return undefined;
  }
};

export const isSamePermissionsActor = (
  authContext: PermissionsAuthContext,
  otherAuthContext: PermissionsAuthContext,
): boolean =>
  authContext.workspace.id === otherAuthContext.workspace.id &&
  authContext.type === otherAuthContext.type &&
  getActorId(authContext) === getActorId(otherAuthContext);
