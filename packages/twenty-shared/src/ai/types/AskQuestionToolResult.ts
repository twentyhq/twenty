import { type AskQuestionItem } from '@/ai/types/AskQuestionItem';
import { type AskQuestionResponse } from '@/ai/types/AskQuestionResponse';
import { type AskQuestionToolStatus } from '@/ai/types/AskQuestionToolStatus';

export type AskQuestionToolResult = {
  question: AskQuestionItem;
  status: AskQuestionToolStatus;
  answer?: AskQuestionResponse;
};
