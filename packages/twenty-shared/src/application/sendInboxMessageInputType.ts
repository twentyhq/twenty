import { type SendInboxMessageToolCall } from '@/application/sendInboxMessageToolCallType';

export type SendInboxMessageInput = {
  workspaceMemberId: string;
  threadKey: string;
  idempotencyKey: string;
  title: string;
  text: string;
  toolCall?: SendInboxMessageToolCall;
};
