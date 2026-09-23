import { type RecordPermissionsDTO } from 'src/engine/core-modules/record-share/dtos/record-permissions.dto';
import { type AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';

export const serializeAgentChatThreadForBroadcast = ({
  thread,
  lastMessageAt,
  permissions,
}: {
  thread: AgentChatThreadEntity;
  lastMessageAt: Date | null;
  permissions: RecordPermissionsDTO;
}) => ({
  id: thread.id,
  permissions,

  title: thread.title,
  totalInputTokens: thread.totalInputTokens,
  totalOutputTokens: thread.totalOutputTokens,
  totalCacheReadTokens: thread.totalCacheReadTokens,
  totalCacheCreationTokens: thread.totalCacheCreationTokens,
  contextWindowTokens: thread.contextWindowTokens,
  conversationSize: thread.conversationSize,
  totalInputCredits: toDisplayCredits(thread.totalInputCredits),
  totalOutputCredits: toDisplayCredits(thread.totalOutputCredits),
  deletedAt: thread.deletedAt,
  lastMessageAt,
  createdAt: thread.createdAt,
  updatedAt: thread.updatedAt,
});
