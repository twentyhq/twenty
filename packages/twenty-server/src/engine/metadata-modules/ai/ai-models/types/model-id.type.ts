import { type DEFAULT_FAST_MODEL } from 'src/engine/metadata-modules/ai/ai-models/types/default-fast-model.const';
import { type DEFAULT_SMART_MODEL } from 'src/engine/metadata-modules/ai/ai-models/types/default-smart-model.const';

export type ModelId =
  | typeof DEFAULT_FAST_MODEL
  | typeof DEFAULT_SMART_MODEL
  | (string & {});
