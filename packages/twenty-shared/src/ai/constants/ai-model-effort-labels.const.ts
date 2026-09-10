import { type AiModelEffort } from './ai-model-effort.const';

// What each level means to a reader: `none` runs the model without reasoning,
// which is why it is faster and scores lower than `low`.
export const AI_MODEL_EFFORT_LABELS: Record<AiModelEffort, string> = {
  none: 'no reasoning',
  minimal: 'minimal reasoning',
  low: 'low reasoning',
  medium: 'medium reasoning',
  high: 'high reasoning',
  xhigh: 'very high reasoning',
  max: 'max reasoning',
};
