import {
  type AiEvaluationQuestionType,
  type AiSdkPackage,
  type DataResidency,
} from 'twenty-shared/ai';

// Evaluation models answer typed questions instead of emitting text, so they
// carry no context window, no max output and no effort ladder. They are billed
// on input tokens like a language model, which is why the cost fields match.
export type AiEvaluationModelConfig = {
  modelId: string;
  sdkPackage: AiSdkPackage;
  label: string;
  description: string;
  inputCostPerMillionTokens: number;
  outputCostPerMillionTokens: number;
  supportedQuestionTypes: AiEvaluationQuestionType[];
  // Providers cap how many options one choice question may carry; a node that
  // exceeds it is rejected before any network call.
  maxCriteriaPerQuestion?: number;
  // A score rubric is capped far lower than a choice menu, so it is declared
  // separately rather than sharing the option cap.
  maxScoreLevels?: number;
  medianLatencyMs?: number;
  dataResidency?: DataResidency;
  zeroDataRetention?: boolean;
  isDeprecated?: boolean;
};
