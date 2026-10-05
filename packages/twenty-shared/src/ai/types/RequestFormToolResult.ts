import { type AskQuestionToolStatus } from '@/ai/types/AskQuestionToolStatus';

export type RequestFormToolStatus = AskQuestionToolStatus;

// Values are keyed by field name.
export type RequestFormToolResult = {
  status: RequestFormToolStatus;
  values?: Record<string, unknown>;
};
