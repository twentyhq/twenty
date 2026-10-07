import { type SendInboxMessageResult } from 'twenty-shared/application';

export type AgentInboxDelivery = SendInboxMessageResult & {
  isDismissed: boolean;
  // the awaited call as it stands now, which a message delivered earlier may have settled
  awaitedToolCall?: { toolCallId: string; output: unknown };
};
