import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';

export const serializeAgentChatThreadForBroadcast = ({
  thread,
  lastMessageAt,
}: {
  thread: AgentChatThreadWorkspaceEntity;
  lastMessageAt: Date | null;
}) => ({
  id: thread.id,

  title: thread.title,
  totalInputTokens: thread.totalInputTokens,
  totalOutputTokens: thread.totalOutputTokens,
  totalCacheReadTokens: Number(thread.totalCacheReadTokens),
  totalCacheCreationTokens: Number(thread.totalCacheCreationTokens),
  contextWindowTokens: thread.contextWindowTokens,
  conversationSize: thread.conversationSize,
  totalInputCredits: toDisplayCredits(Number(thread.totalInputCredits)),
  totalOutputCredits: toDisplayCredits(Number(thread.totalOutputCredits)),
  deletedAt: thread.archivedAt,
  lastMessageAt,
  createdAt: thread.createdAt,
  updatedAt: thread.updatedAt,
});
