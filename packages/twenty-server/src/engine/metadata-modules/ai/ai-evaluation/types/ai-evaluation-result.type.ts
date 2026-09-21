import { type BillingTokenUsage } from 'src/engine/metadata-modules/ai/ai-billing/types/billing-token-usage.type';
import { type AiEvaluationModelAnswer } from 'src/engine/metadata-modules/ai/ai-models/types/ai-evaluation-model.type';

export type AiEvaluationRunnerKind = 'evaluation-model';

export type AiEvaluationUsage = BillingTokenUsage;

export type AiEvaluationRunnerOutput = {
  answers: Record<string, AiEvaluationModelAnswer>;
  usage: AiEvaluationUsage;
};

export type AiEvaluationResult = AiEvaluationRunnerOutput & {
  modelId: string;
  runnerKind: AiEvaluationRunnerKind;
};
