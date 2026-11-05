import { type AiDataResidencyPolicy } from '../constants/model-residencies-allowed-by-policy.const';

export type AiDataPolicy = {
  dataResidency: AiDataResidencyPolicy | null;
  isZeroDataRetentionRequired: boolean;
};
