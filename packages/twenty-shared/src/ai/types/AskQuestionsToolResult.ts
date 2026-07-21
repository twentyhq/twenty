import { type AskQuestionAnswer } from '@/ai/types/AskQuestionAnswer';
import { type AskQuestionItem } from '@/ai/types/AskQuestionItem';
import { type AskQuestionsToolStatus } from '@/ai/types/AskQuestionsToolStatus';

export type AskQuestionsToolResult = {
  questions: AskQuestionItem[];
  status: AskQuestionsToolStatus;
  answers?: AskQuestionAnswer[];
};
