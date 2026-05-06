import { type ToolSet } from 'ai';

import { type RegisteredAiModel } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { type NativeModelToolOptions } from 'src/engine/metadata-modules/ai/ai-models/types/native-model-tool-options.type';

// Parallel to ToolProvider — emits opaque SDK-native tools, not registry descriptors.
export interface NativeToolBinder {
  bind(model: RegisteredAiModel, options: NativeModelToolOptions): ToolSet;
}
