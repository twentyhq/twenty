import { ModelFamily } from 'src/engine/metadata-modules/ai/ai-models/types/model-family.enum';

// Maps models.dev provider names to model families.
const NAME_TO_MODEL_FAMILY: Record<string, ModelFamily> = {
  openai: ModelFamily.GPT,
  anthropic: ModelFamily.CLAUDE,
  google: ModelFamily.GEMINI,
  mistral: ModelFamily.MISTRAL,
  xai: ModelFamily.GROK,
};

// For aggregator providers (Groq, Bedrock, etc.), detect model family
// from the model's raw ID rather than assuming a fixed mapping.
const MODEL_ID_FAMILY_PATTERNS: [RegExp, ModelFamily][] = [
  [/claude/i, ModelFamily.CLAUDE],
  [/gpt|o[134]-|chatgpt/i, ModelFamily.GPT],
  [/gemini/i, ModelFamily.GEMINI],
  [/mistral|mixtral|pixtral/i, ModelFamily.MISTRAL],
  [/grok/i, ModelFamily.GROK],
];

export const inferModelFamily = (
  providerName: string,
  modelName?: string,
): ModelFamily | undefined => {
  if (modelName) {
    for (const [pattern, family] of MODEL_ID_FAMILY_PATTERNS) {
      if (pattern.test(modelName)) {
        return family;
      }
    }
  }

  return NAME_TO_MODEL_FAMILY[providerName];
};
