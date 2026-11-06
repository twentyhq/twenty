import {
  DATA_RESIDENCY_REGIONS,
  type DataResidencyRegion,
} from '../constants/data-residency-regions.const';

export const isDataResidencyRegion = (
  value: string | null | undefined,
): value is DataResidencyRegion =>
  DATA_RESIDENCY_REGIONS.some(
    (dataResidencyRegion) => dataResidencyRegion === value,
  );
