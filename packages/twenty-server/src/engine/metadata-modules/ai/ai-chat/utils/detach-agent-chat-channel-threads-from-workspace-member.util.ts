import { hasAgentChatThreadChannelField } from 'src/engine/metadata-modules/ai/ai-chat/utils/has-agent-chat-thread-channel-field.util';
import { type AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

// Channel chats outlive their owner, so this runs before the owner's chats are deleted
export const detachAgentChatChannelThreadsFromWorkspaceMember = async ({
  threadRepository,
  flatFieldMetadataMaps,
  workspaceId,
  workspaceMemberId,
}: {
  threadRepository: Pick<
    AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    'query'
  >;
  flatFieldMetadataMaps: Pick<
    FlatEntityMaps<FlatFieldMetadata>,
    'byUniversalIdentifier'
  >;
  workspaceId: string;
  workspaceMemberId: string;
}): Promise<void> => {
  if (!hasAgentChatThreadChannelField({ flatFieldMetadataMaps })) {
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
