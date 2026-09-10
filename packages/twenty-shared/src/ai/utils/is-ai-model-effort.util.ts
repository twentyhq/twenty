import {
  AI_MODEL_EFFORTS,
  type AiModelEffort,
} from '../constants/ai-model-effort.const';

export const isAiModelEffort = (value: string): value is AiModelEffort =>
  (AI_MODEL_EFFORTS as readonly string[]).includes(value);
