import { type DataResidency } from './data-residency.const';

export const MODEL_RESIDENCIES_ALLOWED_BY_POLICY = {
  eu: ['eu', 'de', 'fr'],
} as const satisfies Record<string, readonly DataResidency[]>;

export type AiDataResidencyPolicy =
  keyof typeof MODEL_RESIDENCIES_ALLOWED_BY_POLICY;
