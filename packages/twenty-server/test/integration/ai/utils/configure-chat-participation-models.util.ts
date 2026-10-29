import {
  type Experimental_EvaluationModelV4Answer,
  type Experimental_EvaluationModelV4CallOptions,
  type Experimental_EvaluationModelV4Result,
} from '@ai-sdk/provider';
import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { createScriptedLanguageModel } from 'test/utils/create-scripted-language-model.util';
import { JEV_MODEL_ID } from 'twenty-shared/ai';

import {
  type AiModelRegistryService,
  type RegisteredAiEvaluationModel,
  type RegisteredAiModel,
} from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

const createRealmIndependentRecord = <TRecord extends object>(
  record: TRecord,
): TRecord => Object.assign(Object.create(null), record);

const createReplyEvaluation = (
  probability: number,
): Experimental_EvaluationModelV4Result => ({
  answers: createRealmIndependentRecord({
    shouldAssistantReply:
      createRealmIndependentRecord<Experimental_EvaluationModelV4Answer>({
        type: 'boolean',
        probability,
      }),
  }),
  usage: { inputTokens: 1, outputTokens: 0 },
  warnings: [],
});

export const configureChatParticipationModels = () => {
  const registry = getAppProviderByClassName<AiModelRegistryService>(
    'AiModelRegistryService',
  );
  const languageModel = createScriptedLanguageModel(() => ({
    content: [{ type: 'text', text: 'Ada answered the message.' }],
    finishReason: { unified: 'stop', raw: undefined },
    usage: {
      inputTokens: {
        total: 1,
        noCache: 1,
        cacheRead: undefined,
        cacheWrite: undefined,
      },
      outputTokens: { total: 1, text: 1, reasoning: undefined },
    },
  }));
  const registeredModel: RegisteredAiModel = {
    modelId: TEST_AI_MODEL_ID,
    sdkPackage: '@ai-sdk/openai',
    model: languageModel,
  };
  const evaluate = jest.fn<
    Promise<Experimental_EvaluationModelV4Result>,
    [Experimental_EvaluationModelV4CallOptions]
  >(async () => createReplyEvaluation(0.8));
  const registeredEvaluationModel: RegisteredAiEvaluationModel = {
    modelId: JEV_MODEL_ID,
    providerName: 'typesafe-ai',
    sdkPackage: '@ai-sdk/typesafe-ai',
    model: {
      specificationVersion: 'v4',
      provider: 'typesafe-ai',
      modelId: JEV_MODEL_ID,
      supportedQuestionTypes: ['boolean'],
      doEvaluate: evaluate,
    },
  };
  const spies = [
    jest
      .spyOn(registry, 'getAvailableModels')
      .mockReturnValue([registeredModel]),
    jest.spyOn(registry, 'getModel').mockReturnValue(registeredModel),
    jest
      .spyOn(registry, 'resolveModelForAgent')
      .mockReturnValue(registeredModel),
  ];
  const evaluationModel = jest
    .spyOn(registry, 'getEvaluationModel')
    .mockReturnValue(undefined);

  return {
    evaluate,
    setReplyProbability: (probability: number) =>
      evaluate.mockResolvedValue(createReplyEvaluation(probability)),
    enableEvaluation: () =>
      evaluationModel.mockReturnValue(registeredEvaluationModel),
    restore: () => {
      for (const spy of [...spies, evaluationModel]) {
        spy.mockRestore();
      }
    },
  };
};
