import { type AgentChatChannelEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel.entity';
import { buildAgentChatChannelDeletionLockKey } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-channel-deletion-lock-key.util';
import { throwAgentChatChannelBusy } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-channel-busy.util';
import { throwAgentChatChannelNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-channel-not-found.util';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

export const lockAgentChatChannelForThreadWriteOrThrow = async ({
  transactionScope,
  channelRepository,
  workspaceId,
  channelId,
}: {
  transactionScope: Pick<WorkspaceTransactionScope, 'executeRawQuery'>;
  channelRepository: Pick<
    WorkspaceScopedRepository<AgentChatChannelEntity>,
    'existsBy'
  >;
  workspaceId: string;
  channelId: string;
}): Promise<void> => {
  const [{ isLocked }] = await transactionScope.executeRawQuery(
    'SELECT pg_try_advisory_xact_lock_shared(hashtextextended($1, 0)) AS "isLocked"',
    [buildAgentChatChannelDeletionLockKey({ workspaceId, channelId })],
  );

  if (isLocked !== true) {
    throwAgentChatChannelBusy();
  }

  const doesChannelExist = await channelRepository.existsBy(workspaceId, {
    id: channelId,
  });

  if (!doesChannelExist) {
    throwAgentChatChannelNotFound();
  }
};
