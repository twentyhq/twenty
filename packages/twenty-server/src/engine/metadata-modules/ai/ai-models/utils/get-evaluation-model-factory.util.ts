import { type AiEvaluationModel } from 'src/engine/metadata-modules/ai/ai-models/types/ai-evaluation-model.type';

type EvaluationCapableProvider = {
  evaluationModel: (modelId: string) => AiEvaluationModel;
};

// Duck-typed rather than keyed by npm package: any provider exposing the SDK's
// evaluation factory qualifies, so a gateway proxying several evaluation models
// needs no entry here.
const hasEvaluationFactory = (
  provider: unknown,
): provider is EvaluationCapableProvider =>
  typeof (provider as Partial<EvaluationCapableProvider>)?.evaluationModel ===
  'function';

export const getEvaluationModelFactory = (
  provider: unknown,
): ((modelId: string) => AiEvaluationModel) | undefined => {
  if (!hasEvaluationFactory(provider)) {
    return undefined;
  }

  return (modelId: string) => provider.evaluationModel(modelId);
};
