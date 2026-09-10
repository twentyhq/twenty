import { type AiModelEffort } from './ai-model-effort.const';

export const AI_MODEL_EFFORT_LABELS: Record<AiModelEffort, string> = {
  none: 'no reasoning',
  minimal: 'minimal reasoning',
  low: 'low reasoning',
  medium: 'medium reasoning',
  high: 'high reasoning',
  xhigh: 'very high reasoning',
  max: 'max reasoning',
};
