import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const IS_READ_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.messageChannelMessageAssociation.fields.isRead
    .universalIdentifier;

// Fence until upgrade:2-59:add-message-channel-message-association-is-read-field has reached every workspace
export const isMessageReadStateProvisioned = async ({
  workspaceCacheService,
  workspaceId,
}: {
  workspaceCacheService: Pick<WorkspaceCacheService, 'getOrRecompute'>;
  workspaceId: string;
}): Promise<boolean> => {
  const { flatFieldMetadataMaps } = await workspaceCacheService.getOrRecompute(
    workspaceId,
    ['flatFieldMetadataMaps'],
  );

  return isDefined(
    flatFieldMetadataMaps.byUniversalIdentifier[
      IS_READ_FIELD_UNIVERSAL_IDENTIFIER
    ],
  );
};
