import {
  AI_DATA_RESIDENCY_POLICIES,
  type AiDataResidencyPolicy,
} from '../constants/model-residencies-allowed-by-policy.const';

export const isAiDataResidencyPolicy = (
  value: string | null | undefined,
): value is AiDataResidencyPolicy =>
  AI_DATA_RESIDENCY_POLICIES.some((policy) => policy === value);
