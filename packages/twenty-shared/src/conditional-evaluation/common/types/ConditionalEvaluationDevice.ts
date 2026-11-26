import { type CONDITIONAL_EVALUATION_DEVICES } from '@/conditional-evaluation/common/constants/ConditionalEvaluationDevices';

export type ConditionalEvaluationDevice =
  (typeof CONDITIONAL_EVALUATION_DEVICES)[number];
