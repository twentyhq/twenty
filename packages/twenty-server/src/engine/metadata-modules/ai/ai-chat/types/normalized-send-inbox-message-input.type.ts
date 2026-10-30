import { type InboxThreadRecordInput } from 'twenty-shared/application';

import { type InboxMessageAddressing } from 'src/engine/metadata-modules/ai/ai-chat/types/inbox-message-addressing.type';

export type NormalizedSendInboxMessageInput = {
  addressing: InboxMessageAddressing;
  idempotencyKey: string;
  text: string;
  toolCall?: unknown;
  workspaceMemberIds: string[];
  mentionedWorkspaceMemberIds: string[];
  recordTargets: Omit<InboxThreadRecordInput, 'threadId'>[];
};
