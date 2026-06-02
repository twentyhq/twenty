import { type NativeModelToolKey } from 'src/engine/metadata-modules/ai/ai-models/types/native-model-tool-key.type';

export type NativeModelTools = Partial<
  Record<
    NativeModelToolKey,
    {
      kind: 'sdk-tool';
      directToolName: string;
    }
  >
>;
