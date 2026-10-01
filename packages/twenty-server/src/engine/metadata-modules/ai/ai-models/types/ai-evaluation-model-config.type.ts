import {
  type AiEvaluationQuestionType,
  type AiSdkPackage,
  type DataResidency,
} from 'twenty-shared/ai';

// billed on tokens like a language model, hence the matching cost fields
export type AiEvaluationModelConfig = {
  modelId: string;
  providerName: string;
  name: string;
  sdkPackage: AiSdkPackage;
  label: string;
  description: string;
  inputCostPerMillionTokens: number;
  outputCostPerMillionTokens: number;
  supportedQuestionTypes: AiEvaluationQuestionType[];
  maxCriteriaPerQuestion?: number;
  maxScoreLevels?: number;
  medianLatencyMs?: number;
  dataResidency?: DataResidency;
  zeroDataRetention?: boolean;
  isDeprecated?: boolean;
};
