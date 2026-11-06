import { type DataResidency } from './data-residency.const';
import { type DataResidencyRegion } from './data-residency-regions.const';

export const DATA_RESIDENCIES_BY_REGION: Record<
  DataResidencyRegion,
  readonly DataResidency[]
> = {
  eu: ['eu', 'de', 'fr'],
};
