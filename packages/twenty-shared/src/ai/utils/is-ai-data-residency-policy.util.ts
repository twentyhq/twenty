import { AI_DATA_RESIDENCY_POLICIES } from '../constants/ai-data-residency-policies.const';
import { type AiDataResidencyPolicy } from '../constants/model-residencies-allowed-by-policy.const';

export const isAiDataResidencyPolicy = (
  value: string | null | undefined,
): value is AiDataResidencyPolicy =>
  AI_DATA_RESIDENCY_POLICIES.some((policy) => policy === value);
