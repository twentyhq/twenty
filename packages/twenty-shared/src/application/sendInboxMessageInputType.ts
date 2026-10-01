import { type SendInboxMessageRequest } from '@/application/sendInboxMessageRequestType';

export type SendInboxMessageInput = {
  workspaceMemberId: string;
  threadKey: string;
  idempotencyKey: string;
  title: string;
  text: string;
  request?: SendInboxMessageRequest;
};
