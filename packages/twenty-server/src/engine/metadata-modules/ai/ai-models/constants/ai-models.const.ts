export {
  DEFAULT_FAST_MODEL,
  DEFAULT_SMART_MODEL,
  ModelProvider,
  type AIModelConfig,
  type ModelId,
  type SupportedFileType,
} from './ai-models-types.const';

import { type AIModelConfig } from './ai-models-types.const';
import { ANTHROPIC_MODELS } from './anthropic-models.const';
import { OPENAI_MODELS } from './openai-models.const';
import { XAI_MODELS } from './xai-models.const';

export const AI_MODELS: AIModelConfig[] = [
  ...OPENAI_MODELS,
  ...ANTHROPIC_MODELS,
  ...XAI_MODELS,
];
