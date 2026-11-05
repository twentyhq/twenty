import { type AgentHistoryStorageContext } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-storage-context.type';

// Runs in a participant write's transaction, after the participant row is
// locked, in the order member activity takes the two locks
export type AgentChatThreadWriteStep = (
  context: AgentHistoryStorageContext & { threadId: string },
) => Promise<void>;
