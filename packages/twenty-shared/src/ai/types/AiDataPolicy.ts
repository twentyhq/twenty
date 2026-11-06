import { type DataResidencyRegion } from '../constants/data-residency-regions.const';

export type AiDataPolicy = {
  requiredDataResidency: DataResidencyRegion | null;
  isZeroDataRetentionRequired: boolean;
  isProductImprovementDataSharingEnabled: boolean;
};
