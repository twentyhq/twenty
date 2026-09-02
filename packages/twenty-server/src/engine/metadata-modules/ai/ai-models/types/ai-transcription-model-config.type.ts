import { type AiSdkPackage, type DataResidency } from 'twenty-shared/ai';

// Separate from AiModelConfig so computeCostBreakdown is never reachable with a
// model that has no token semantics.
export type AiTranscriptionModelConfig = {
  modelId: string;
  sdkPackage: AiSdkPackage;
  label: string;
  description: string;
  dataResidency?: DataResidency;
  costPerMinute: number;
  isDeprecated?: boolean;
};
