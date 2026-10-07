import { isDefined } from 'twenty-shared/utils';

import { findAgentChatFlatObjectMetadata } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-flat-object-metadata.util';
import { getAgentChatChannelTables } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-channel-tables.util';
import { type AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// A chat in a channel is the channel's, so a member being removed leaves it
// there without an owner instead of taking it with them. Runs before the
// member is deleted, whose owner relation would delete the chat. The member
// also leaves their channels, along with the grants they read through
export const detachAgentChatChannelThreadsFromWorkspaceMember = async ({
  threadRepository,
  flatObjectMetadataMaps,
  workspaceId,
  workspaceMemberId,
}: {
  threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  workspaceId: string;
  workspaceMemberId: string;
}): Promise<void> => {
  if (
    !isDefined(
      findAgentChatFlatObjectMetadata(
        flatObjectMetadataMaps,
        'agentChatChannel',
      ),
    )
  ) {
    return;
  }

  const { memberTable, recordShareTable } =
    getAgentChatChannelTables(workspaceId);

  await threadRepository.query(workspaceId, async ({ manager, table }) => {
    await manager.query(
      `UPDATE ${table('agentChatThread')}
       SET "workspaceMemberId" = NULL, "userWorkspaceId" = NULL, "updatedAt" = now()
       WHERE "workspaceMemberId" = $1 AND "channelId" IS NOT NULL`,
      [workspaceMemberId],
    );
    await manager.query(
      `WITH removed_membership AS (
         DELETE FROM ${memberTable} WHERE "workspaceMemberId" = $1
         RETURNING id
       )
       DELETE FROM ${recordShareTable}
       WHERE "rowCause" = 'RULE'
         AND "sourceId" IN (SELECT id FROM removed_membership)`,
      [workspaceMemberId],
    );
  });
};
