import { type DataResidency } from './data-residency.const';

export const DATA_RESIDENCIES_BY_AI_DATA_RESIDENCY_POLICY = {
  eu: ['eu', 'de', 'fr'],
} as const satisfies Record<string, readonly DataResidency[]>;

export type AiDataResidencyPolicy =
  keyof typeof DATA_RESIDENCIES_BY_AI_DATA_RESIDENCY_POLICY;
