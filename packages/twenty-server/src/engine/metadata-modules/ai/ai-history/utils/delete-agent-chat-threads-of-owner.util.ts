import { type AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { type AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { getAgentChatThreadOwnerColumn } from 'src/engine/metadata-modules/ai/ai-history/utils/get-agent-chat-thread-owner-column.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

// Member removal deletes the membership first, so threads are matched by the
// removed identifiers directly instead of resolving the owner through it.
export const deleteAgentChatThreadsOfOwner = ({
  agentChatThreadRepository,
  workspaceId,
  userWorkspaceId,
  workspaceMemberId,
}: {
  agentChatThreadRepository: AgentHistoryRepository<AgentChatThreadEntity>;
  workspaceId: string;
  userWorkspaceId: string;
  workspaceMemberId: string;
}): Promise<void> =>
  agentChatThreadRepository.query(
    workspaceId,
    async ({ manager, table, storage }) => {
      const ownerColumn = await getAgentChatThreadOwnerColumn({
        manager,
        workspaceId,
        storage,
      });

      await manager.query(
        `DELETE FROM ${table('agentChatThread')} WHERE ${escapeIdentifier(ownerColumn)} = $1 ${storage === 'core' ? 'AND "workspaceId" = $2' : ''}`,
        [
          ownerColumn === 'workspaceMemberId'
            ? workspaceMemberId
            : userWorkspaceId,
          ...(storage === 'core' ? [workspaceId] : []),
        ],
      );
    },
  );
