import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export const findAgentChatFlatObjectMetadata = async ({
  workspaceCacheService,
  workspaceId,
  standardObjectName,
}: {
  workspaceCacheService: WorkspaceCacheService;
  workspaceId: string;
  standardObjectName: 'agentChatThread' | 'agentChatThreadParticipant';
}) => {
  const { flatObjectMetadataMaps } = await workspaceCacheService.getOrRecompute(
    workspaceId,
    ['flatObjectMetadataMaps'],
  );

  return flatObjectMetadataMaps.byUniversalIdentifier[
    STANDARD_OBJECTS[standardObjectName].universalIdentifier
  ];
};
