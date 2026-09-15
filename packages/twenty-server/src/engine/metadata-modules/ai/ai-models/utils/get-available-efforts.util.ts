import { type AiModelEffort } from 'twenty-shared/ai';

import { AI_SDK_PACKAGE_EFFORTS } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package-efforts.const';
import { type AiModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-config.type';

export const getAvailableEfforts = (
  model: Pick<AiModelConfig, 'sdkPackage' | 'efforts'>,
): AiModelEffort[] => {
  const sdkEfforts = AI_SDK_PACKAGE_EFFORTS[model.sdkPackage] ?? [];

  return (model.efforts ?? []).filter((effort) => sdkEfforts.includes(effort));
};
