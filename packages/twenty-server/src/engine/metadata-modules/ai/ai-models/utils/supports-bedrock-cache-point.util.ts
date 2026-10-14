import { isDefined } from 'twenty-shared/utils';

import { AI_SDK_BEDROCK } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';
import { BEDROCK_CACHE_POINT_MODEL_FAMILIES } from 'src/engine/metadata-modules/ai/ai-models/constants/bedrock-cache-point-model-families.constant';
import { type AiModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-config.type';

export const supportsBedrockCachePoint = ({
  sdkPackage,
  modelFamily,
}: Pick<AiModelConfig, 'sdkPackage' | 'modelFamily'>): boolean =>
  sdkPackage === AI_SDK_BEDROCK &&
  isDefined(modelFamily) &&
  BEDROCK_CACHE_POINT_MODEL_FAMILIES.includes(modelFamily);
