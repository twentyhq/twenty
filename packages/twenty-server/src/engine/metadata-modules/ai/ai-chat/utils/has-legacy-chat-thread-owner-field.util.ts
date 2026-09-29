import { isDefined } from 'twenty-shared/utils';

import { LEGACY_CHAT_THREAD_OWNER_FIELD_UNIVERSAL_IDENTIFIER } from 'src/engine/metadata-modules/ai/ai-chat/constants/legacy-chat-thread-owner-field-universal-identifier.constant';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// The owner contract removes this required column per workspace during deployment.
export const hasLegacyChatThreadOwnerField = async (
  workspaceId: string,
  workspaceCacheService: WorkspaceCacheService,
): Promise<boolean> => {
  const { flatFieldMetadataMaps } = await workspaceCacheService.getOrRecompute(
    workspaceId,
    ['flatFieldMetadataMaps'],
  );
  return isDefined(
    flatFieldMetadataMaps.byUniversalIdentifier[
      LEGACY_CHAT_THREAD_OWNER_FIELD_UNIVERSAL_IDENTIFIER
    ],
  );
};
