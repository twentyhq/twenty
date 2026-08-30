import { type AiSdkPackage, type DataResidency } from 'twenty-shared/ai';

// Kept separate from AiModelConfig rather than bolted on as optional fields:
// transcription has no token semantics, so computeCostBreakdown must never be
// reachable with one of these.
export type AiTranscriptionModelConfig = {
  modelId: string;
  sdkPackage: AiSdkPackage;
  label: string;
  description: string;
  dataResidency?: DataResidency;
  costPerMinute: number;
  isDeprecated?: boolean;
};
