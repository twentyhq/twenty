import { AiProvider } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider.enum';
import { ModelFamily } from 'src/engine/metadata-modules/ai/ai-models/types/model-family.enum';

const PROVIDER_TO_MODEL_FAMILY: Partial<Record<AiProvider, ModelFamily>> = {
  [AiProvider.OPENAI]: ModelFamily.OPENAI,
  [AiProvider.ANTHROPIC]: ModelFamily.ANTHROPIC,
  [AiProvider.GOOGLE]: ModelFamily.GOOGLE,
  [AiProvider.MISTRAL]: ModelFamily.MISTRAL,
  [AiProvider.XAI]: ModelFamily.XAI,
};

// For aggregator providers (Groq, Bedrock, etc.), detect model family
// from the model's raw ID rather than assuming a fixed mapping.
const MODEL_ID_FAMILY_PATTERNS: [RegExp, ModelFamily][] = [
  [/claude/i, ModelFamily.ANTHROPIC],
  [/gpt|o[134]-|chatgpt/i, ModelFamily.OPENAI],
  [/gemini/i, ModelFamily.GOOGLE],
  [/mistral|mixtral|pixtral/i, ModelFamily.MISTRAL],
  [/grok/i, ModelFamily.XAI],
];

export const inferModelFamily = (
  provider: AiProvider,
  rawModelId?: string,
): ModelFamily | undefined => {
  const fromProvider = PROVIDER_TO_MODEL_FAMILY[provider];

  if (fromProvider) {
    return fromProvider;
  }

  if (rawModelId) {
    for (const [pattern, family] of MODEL_ID_FAMILY_PATTERNS) {
      if (pattern.test(rawModelId)) {
        return family;
      }
    }
  }

  return undefined;
};
