import {
  type AiDataResidencyPolicy,
  MODEL_RESIDENCIES_ALLOWED_BY_POLICY,
} from './model-residencies-allowed-by-policy.const';

export const AI_DATA_RESIDENCY_POLICIES = Object.keys(
  MODEL_RESIDENCIES_ALLOWED_BY_POLICY,
) as AiDataResidencyPolicy[];
