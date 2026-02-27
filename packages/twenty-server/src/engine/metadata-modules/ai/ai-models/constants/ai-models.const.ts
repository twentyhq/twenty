export {
  DEFAULT_FAST_MODEL,
  DEFAULT_SMART_MODEL,
  InferenceProvider,
  ModelFamily,
  type AIModelConfig,
  type ModelId,
  type SupportedFileType,
} from './ai-models-types.const';

import { type AIModelConfig } from './ai-models-types.const';
import { ANTHROPIC_MODELS } from './anthropic-models.const';
import { BEDROCK_MODELS } from './bedrock-models.const';
import { GOOGLE_MODELS } from './google-models.const';
import { GROQ_MODELS } from './groq-models.const';
import { MISTRAL_MODELS } from './mistral-models.const';
import { OPENAI_MODELS } from './openai-models.const';
import { XAI_MODELS } from './xai-models.const';

export const AI_MODELS: AIModelConfig[] = [
  ...OPENAI_MODELS,
  ...ANTHROPIC_MODELS,
  ...BEDROCK_MODELS,
  ...GOOGLE_MODELS,
  ...XAI_MODELS,
  ...GROQ_MODELS,
  ...MISTRAL_MODELS,
];
