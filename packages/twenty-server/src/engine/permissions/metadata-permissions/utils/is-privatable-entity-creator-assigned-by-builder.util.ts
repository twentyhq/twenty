import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { isSystemAuthContext } from 'src/engine/core-modules/auth/guards/is-system-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { isPrivatableMetadataName } from 'src/engine/permissions/metadata-permissions/utils/is-privatable-metadata-name.util';

export const isPrivatableEntityCreatorAssignedByBuilder = ({
  metadataName,
  authContext,
}: {
  metadataName: AllMetadataName;
  authContext: WorkspaceAuthContext | undefined;
}): boolean =>
  isPrivatableMetadataName(metadataName) &&
  !(isDefined(authContext) && isSystemAuthContext(authContext));
