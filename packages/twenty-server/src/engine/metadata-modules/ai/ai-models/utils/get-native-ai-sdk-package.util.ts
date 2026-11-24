import { type AiSdkPackage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import {
  AI_SDK_GROQ,
  AI_SDK_OPENAI_COMPATIBLE,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.constant';
import { type AiProviderConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-config.type';

const GROQ_API_HOSTNAME = 'api.groq.com';

export const getNativeAiSdkPackage = ({
  npm,
  baseUrl,
}: Pick<AiProviderConfig, 'npm' | 'baseUrl'>): AiSdkPackage =>
  npm === AI_SDK_OPENAI_COMPATIBLE &&
  isDefined(baseUrl) &&
  URL.parse(baseUrl)?.hostname === GROQ_API_HOSTNAME
    ? AI_SDK_GROQ
    : npm;
