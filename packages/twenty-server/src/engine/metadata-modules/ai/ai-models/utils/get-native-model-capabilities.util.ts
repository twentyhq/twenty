import { type AiSdkPackage } from 'twenty-shared/ai';

import { type NativeModelToolKey } from 'src/engine/metadata-modules/ai/ai-models/types/native-model-tool-key.type';
import { getNativeModelToolsForSdkPackage } from 'src/engine/metadata-modules/ai/ai-models/utils/get-native-model-tools-for-sdk-package.util';

export const getNativeModelCapabilities = (
  sdkPackage?: AiSdkPackage | null,
): Partial<Record<NativeModelToolKey, boolean>> | undefined => {
  const tools = getNativeModelToolsForSdkPackage(sdkPackage);

  if (!tools) {
    return undefined;
  }

  return Object.fromEntries(
    Object.keys(tools).map((toolKey) => [toolKey, true]),
  );
};
