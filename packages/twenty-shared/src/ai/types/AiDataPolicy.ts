import { type AiDataResidencyPolicy } from '../constants/data-residencies-by-ai-data-residency-policy.const';

export type AiDataPolicy = {
  dataResidency: AiDataResidencyPolicy | null;
  isZeroDataRetentionRequired: boolean;
};
