import {
  CHATGPT_PLAN_DEV_API_KEY_PLACEHOLDER,
  CHATGPT_PLAN_DEV_DEFAULT_MODEL_NAMES,
  CHATGPT_PLAN_DEV_MODELS_VARIABLE,
} from 'src/engine/metadata-modules/ai/ai-models/chatgpt-plan-dev/chatgpt-plan-dev-provider.const';
import { type AiProviderConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-config.type';
import { ModelFamily } from 'src/engine/metadata-modules/ai/ai-models/types/model-family.enum';

const getModelNames = (environment: NodeJS.ProcessEnv): string[] => {
  const configuredNames = (environment[CHATGPT_PLAN_DEV_MODELS_VARIABLE] ?? '')
    .split(',')
    .map((name) => name.trim())
    .filter((name) => name.length > 0);

  return configuredNames.length > 0
    ? configuredNames
    : CHATGPT_PLAN_DEV_DEFAULT_MODEL_NAMES;
};

// Plan usage is not billed per token, so the models carry zero prices.
export const buildChatGptPlanDevProviderConfig = (
  environment: NodeJS.ProcessEnv = process.env,
): AiProviderConfig => ({
  npm: '@ai-sdk/openai',
  label: 'ChatGPT plan (local dev)',
  apiKey: CHATGPT_PLAN_DEV_API_KEY_PLACEHOLDER,
  models: getModelNames(environment).map((name) => ({
    name,
    label: `${name} (ChatGPT plan)`,
    modelFamily: ModelFamily.GPT,
    inputCostPerMillionTokens: 0,
    outputCostPerMillionTokens: 0,
    cachedInputCostPerMillionTokens: 0,
    contextWindowTokens: 272000,
    maxOutputTokens: 64000,
    modalities: ['image'],
    supportsReasoning: true,
    efforts: ['low', 'medium', 'high'],
  })),
});
