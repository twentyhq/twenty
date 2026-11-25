import { type DataResidencyRegion } from '../constants/data-residency-regions.const';

export type AiDataPolicy = {
  requiredDataResidencyRegion: DataResidencyRegion | null;
  isZeroDataRetentionRequired: boolean;
  isProductImprovementDataSharingEnabled: boolean;
};
