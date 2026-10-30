import { type InboxThreadRecordInput } from '@/application/inboxThreadRecordInputType';
import { type SendInboxMessageToolCall } from '@/application/sendInboxMessageToolCallType';

export type SendInboxMessageInput = {
  workspaceMemberIds?: string[];
  mentionedWorkspaceMemberIds?: string[];
  threadKey?: string;
  threadId?: string;
  channelId?: string;
  idempotencyKey: string;
  title?: string;
  text: string;
  toolCall?: SendInboxMessageToolCall;
  recordTargets?: Omit<InboxThreadRecordInput, 'threadId'>[];
};
