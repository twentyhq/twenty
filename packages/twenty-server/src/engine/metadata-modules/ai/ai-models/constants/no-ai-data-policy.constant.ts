import { type AiDataPolicy } from 'twenty-shared/ai';

export const NO_AI_DATA_POLICY: AiDataPolicy = {
  requiredDataResidencyRegion: null,
  isZeroDataRetentionRequired: false,
  isProductImprovementDataSharingEnabled: true,
};
