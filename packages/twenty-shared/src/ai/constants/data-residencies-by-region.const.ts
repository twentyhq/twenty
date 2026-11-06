import { type DataResidency } from './data-residency.const';

export const DATA_RESIDENCIES_BY_REGION = {
  eu: ['eu', 'de', 'fr'],
} as const satisfies Record<string, readonly DataResidency[]>;

export type DataResidencyRegion = keyof typeof DATA_RESIDENCIES_BY_REGION;
