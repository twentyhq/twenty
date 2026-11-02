import { type InboxThreadRecordInput } from '@/application/inboxThreadRecordInputType';
import { type SendInboxMessageToolCall } from '@/application/sendInboxMessageToolCallType';

export type SendInboxMessageInput = {
  workspaceMemberIds?: string[];
  mentionedWorkspaceMemberIds?: string[];
  idempotencyKey: string;
  text: string;
  toolCall?: SendInboxMessageToolCall;
  recordTargets?: Omit<InboxThreadRecordInput, 'threadId'>[];
} & (
  | {
      threadKey: string;
      title: string;
      channelId?: string;
      threadId?: never;
    }
  | {
      threadId: string;
      threadKey?: never;
      channelId?: never;
      title?: string;
    }
);
