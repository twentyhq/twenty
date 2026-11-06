import {
  type DataResidencyRegion,
  DATA_RESIDENCIES_BY_REGION,
} from './data-residencies-by-region.const';

export const DATA_RESIDENCY_REGIONS = Object.keys(
  DATA_RESIDENCIES_BY_REGION,
) as DataResidencyRegion[];
