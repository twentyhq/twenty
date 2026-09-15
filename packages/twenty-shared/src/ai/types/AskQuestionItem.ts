import { type AskQuestionOption } from '@/ai/types/AskQuestionOption';

export type AskQuestionItem = {
  header: string;
  question: string;
  options: AskQuestionOption[];
  allowMultiSelect?: boolean;
};
