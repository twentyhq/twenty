import { type AskQuestionAnswer } from '@/ai/types/AskQuestionAnswer';
import { type AskQuestionItem } from '@/ai/types/AskQuestionItem';
import { type AskQuestionToolStatus } from '@/ai/types/AskQuestionToolStatus';

// calls asked before ask_question took one question at a time
export type AskQuestionsToolResult = {
  questions: AskQuestionItem[];
  status: AskQuestionToolStatus;
  answers?: AskQuestionAnswer[];
};
