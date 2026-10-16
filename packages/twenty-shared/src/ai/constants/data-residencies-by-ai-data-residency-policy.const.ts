import { type AiDataResidencyPolicy } from './ai-data-residency-policy.const';
import { type DataResidency } from './data-residency.const';

export const DATA_RESIDENCIES_BY_AI_DATA_RESIDENCY_POLICY: Record<
  AiDataResidencyPolicy,
  DataResidency[]
> = {
  eu: ['eu', 'de', 'fr'],
};
