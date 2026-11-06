import { type DataResidencyRegion } from '../constants/data-residencies-by-region.const';

export type AiDataPolicy = {
  requiredDataResidency: DataResidencyRegion | null;
  isZeroDataRetentionRequired: boolean;
  isProductImprovementDataSharingEnabled: boolean;
};
