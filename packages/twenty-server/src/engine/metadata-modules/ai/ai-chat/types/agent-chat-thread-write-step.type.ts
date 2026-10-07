import { type AgentHistoryStorageContext } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-workspace-storage.service';

// Runs in a participant write's transaction, after the participant row is
// locked, in the order member activity takes the two locks
export type AgentChatThreadWriteStep = (
  context: AgentHistoryStorageContext,
) => Promise<void>;
