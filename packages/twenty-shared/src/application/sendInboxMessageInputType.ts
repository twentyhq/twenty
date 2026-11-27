import { type SendInboxMessageToolCall } from '@/application/sendInboxMessageToolCallType';

export type SendInboxMessageInput = {
  workspaceMemberIds: string[];
  threadKey: string;
  idempotencyKey: string;
  title: string;
  text: string;
  /** @deprecated Use `toolCalls` instead. */
  toolCall?: SendInboxMessageToolCall;
  toolCalls?: SendInboxMessageToolCall[];
};
