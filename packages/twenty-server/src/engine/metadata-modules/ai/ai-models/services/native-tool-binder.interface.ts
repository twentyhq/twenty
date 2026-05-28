import { type RegisteredAiModel } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { type NativeModelBinding } from 'src/engine/metadata-modules/ai/ai-models/types/native-model-binding.type';
import { type NativeModelToolOptions } from 'src/engine/metadata-modules/ai/ai-models/types/native-model-tool-options.type';

// Parallel to ToolProvider — resolves the complete native-model call payload
// (SDK-native tools + provider options), not registry descriptors.
export interface NativeToolBinder {
  bind(
    model: RegisteredAiModel,
    options: NativeModelToolOptions,
  ): NativeModelBinding;
}
