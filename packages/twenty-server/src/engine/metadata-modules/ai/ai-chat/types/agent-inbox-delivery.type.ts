import { type SendInboxMessageResult } from 'twenty-shared/application';

export type AgentInboxDelivery = SendInboxMessageResult & {
  // the call a message posted for an answer is found again under this id
  toolCallId: string;
  isDismissed: boolean;
  // the awaited call as it stands now, which a message delivered earlier may have settled
  awaitedToolOutput?: unknown;
};
