import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import {
  MetadataOwnershipException,
  MetadataOwnershipExceptionCode,
} from 'src/engine/metadata-modules/metadata-ownership/exceptions/metadata-ownership.exception';
import { type MetadataCaller } from 'src/engine/metadata-modules/metadata-ownership/types/metadata-caller.type';

export const resolveMetadataCallerOrThrow = (
  authContext?: WorkspaceAuthContext,
): MetadataCaller => {
  const resolvedAuthContext =
    authContext ?? workspaceAuthContextStorage.getStore();

  if (!isDefined(resolvedAuthContext)) {
    throw new MetadataOwnershipException(
      'Cannot resolve the caller of a metadata read without a workspace auth context',
      MetadataOwnershipExceptionCode.MISSING_WORKSPACE_AUTH_CONTEXT,
    );
  }

  switch (resolvedAuthContext.type) {
    case 'system':
      return { type: 'bypassesPrivacy' };
    case 'user':
    case 'pendingActivationUser':
      return {
        type: 'workspaceMember',
        userWorkspaceId: resolvedAuthContext.userWorkspaceId,
      };
    case 'apiKey':
    case 'application':
      return { type: 'withoutWorkspaceMember' };
    default:
      return assertUnreachable(resolvedAuthContext);
  }
};
