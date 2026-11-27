import { type SendInboxMessageToolCall } from '@/application/sendInboxMessageToolCallType';

export type SendInboxMessageInput = {
  workspaceMemberIds: string[];
  threadKey: string;
  idempotencyKey: string;
  title: string;
  text: string;
  // set toolCall or toolCalls, not both
  toolCall?: SendInboxMessageToolCall;
  toolCalls?: SendInboxMessageToolCall[];
};
