import { type NativeModelToolKey } from 'src/engine/metadata-modules/ai/ai-models/types/native-model-tool-key.type';

export type NativeModelToolOptions = Partial<
  Record<NativeModelToolKey, boolean>
>;
