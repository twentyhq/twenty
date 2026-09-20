import { type BillingTokenUsage } from 'src/engine/metadata-modules/ai/ai-billing/types/billing-token-usage.type';
import { type AiEvaluationModelAnswer } from 'src/engine/metadata-modules/ai/ai-models/types/ai-evaluation-model.type';

// Which kind of model answered. Callers that read probabilities need this: an
// evaluation model returns a calibrated distribution, a language model asked for
// structured output returns a point answer and nothing to calibrate against.
export const AI_EVALUATION_RUNNER_KINDS = [
  'evaluation-model',
  'language-model',
] as const;

export type AiEvaluationRunnerKind =
  (typeof AI_EVALUATION_RUNNER_KINDS)[number];

// What a runner reports goes straight to calculateAndBillUsage, so it is the
// billing shape rather than a copy of it: an evaluation model fills the totals
// only, while a language model also reports the cached input tokens billing
// charges at the cached rate.
export type AiEvaluationUsage = BillingTokenUsage;

export type AiEvaluationRunnerOutput = {
  answers: Record<string, AiEvaluationModelAnswer>;
  usage: AiEvaluationUsage;
};

export type AiEvaluationResult = AiEvaluationRunnerOutput & {
  modelId: string;
  runnerKind: AiEvaluationRunnerKind;
};
