import { type AskQuestionItem } from '@/ai/types/AskQuestionItem';

export type SendInboxMessageInput = {
  workspaceMemberId: string;
  idempotencyKey: string;
  title: string;
  text: string;
  questions?: AskQuestionItem[];
};

export type SendInboxMessageResult = {
  threadId: string;
};
