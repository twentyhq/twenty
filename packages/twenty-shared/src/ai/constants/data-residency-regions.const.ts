export const DATA_RESIDENCY_REGIONS = ['eu'] as const;

export type DataResidencyRegion = (typeof DATA_RESIDENCY_REGIONS)[number];
