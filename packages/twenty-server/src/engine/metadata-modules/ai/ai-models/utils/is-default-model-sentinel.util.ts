import { DEFAULT_FAST_MODEL } from 'src/engine/metadata-modules/ai/ai-models/types/default-fast-model.const';
import { DEFAULT_SMART_MODEL } from 'src/engine/metadata-modules/ai/ai-models/types/default-smart-model.const';

export const isDefaultModelSentinel = (modelId: string): boolean =>
  modelId === DEFAULT_FAST_MODEL || modelId === DEFAULT_SMART_MODEL;
