import { type PausingToolCallStatus } from '@/ai/constants/pausing-tool-call-statuses.const';

export type ProposeToolCallToolStatus = Exclude<
  PausingToolCallStatus,
  'answered'
>;
