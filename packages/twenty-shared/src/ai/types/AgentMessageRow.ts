import { type AgentMessagePartRow } from '@/ai/utils/map-agent-message-part-to-ui-message-part.util';

export type AgentMessageRow = {
  id: string;
  threadId: string;
  role: string;
  status: string;
  createdAt: string;
  processedAt?: string | null;
  senderWorkspaceMemberId?: string | null;
  senderApplicationId?: string | null;
  agentId?: string | null;
  isBuiltInAssistant?: boolean;
  turnId?: string | null;
  parts: AgentMessagePartRow[];
};
