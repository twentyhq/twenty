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

// Mirrors BillingTokenUsage: an evaluation model reports token counts and
// nothing else, but a language model reports how many of its input tokens were
// cached, and billing charges those at the cached rate.
export type AiEvaluationUsage = {
  inputTokens?: number;
  outputTokens?: number;
  inputTokenDetails?: {
    cacheReadTokens?: number;
  };
  outputTokenDetails?: {
    reasoningTokens?: number;
  };
};

export type AiEvaluationRunnerOutput = {
  answers: Record<string, AiEvaluationModelAnswer>;
  usage: AiEvaluationUsage;
};

export type AiEvaluationResult = AiEvaluationRunnerOutput & {
  modelId: string;
  runnerKind: AiEvaluationRunnerKind;
};
