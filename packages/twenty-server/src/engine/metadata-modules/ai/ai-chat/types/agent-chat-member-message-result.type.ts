import { type AgentChatInboxDeliveryResult } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-inbox-delivery-result.type';

export type AgentChatMemberMessageResult = {
  messageId: string;
  queued: boolean;
  streamId?: string;
  turnId?: string;
  delivery: AgentChatInboxDeliveryResult;
};
