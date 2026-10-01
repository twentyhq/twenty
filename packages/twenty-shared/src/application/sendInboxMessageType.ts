import { type AskQuestionItem } from '@/ai/types/AskQuestionItem';

export type SendInboxMessageInput = {
  workspaceMemberId: string;
  title: string;
  text: string;
  context?: string;
  questions?: AskQuestionItem[];
};

export type SendInboxMessageResult = {
  threadId: string;
};
