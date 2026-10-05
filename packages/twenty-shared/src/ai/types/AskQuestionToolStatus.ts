import { type PausingToolCallStatus } from '@/ai/constants/pausing-tool-call-statuses.const';

export type AskQuestionToolStatus = Extract<
  PausingToolCallStatus,
  'pending' | 'answered' | 'skipped'
>;
