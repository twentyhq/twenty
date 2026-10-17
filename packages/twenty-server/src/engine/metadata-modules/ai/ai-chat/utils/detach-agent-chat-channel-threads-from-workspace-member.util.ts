import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

// A chat in a channel is the channel's, so a member being removed leaves it
// there without an owner instead of taking it with them. Runs before the
// member is deleted, whose owner relation would delete the chat
export const detachAgentChatChannelThreadsFromWorkspaceMember = async ({
  threadRepository,
  flatFieldMetadataMaps,
  workspaceId,
  workspaceMemberId,
}: {
  threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  workspaceId: string;
  workspaceMemberId: string;
}): Promise<void> => {
  if (
    !isDefined(
      flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.fields.channelId.universalIdentifier
      ],
    )
  ) {
    return;
  }

  await threadRepository.query(workspaceId, ({ manager, table }) =>
    manager.query(
      `UPDATE ${table('agentChatThread')}
       SET "workspaceMemberId" = NULL, "updatedAt" = now()
       WHERE "workspaceMemberId" = $1 AND "channelId" IS NOT NULL`,
      [workspaceMemberId],
    ),
  );
};
