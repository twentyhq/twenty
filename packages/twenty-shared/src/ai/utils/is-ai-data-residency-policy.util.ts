import {
  AI_DATA_RESIDENCY_POLICIES,
  type AiDataResidencyPolicy,
} from '../constants/ai-data-residency-policy.const';

export const isAiDataResidencyPolicy = (
  value: unknown,
): value is AiDataResidencyPolicy =>
  typeof value === 'string' &&
  (AI_DATA_RESIDENCY_POLICIES as readonly string[]).includes(value);
