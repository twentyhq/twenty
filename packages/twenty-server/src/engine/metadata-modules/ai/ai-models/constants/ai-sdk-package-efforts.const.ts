import { type AiModelEffort, type AiSdkPackage } from 'twenty-shared/ai';

import {
  AI_SDK_ANTHROPIC,
  AI_SDK_AZURE,
  AI_SDK_BEDROCK,
  AI_SDK_GOOGLE,
  AI_SDK_MISTRAL,
  AI_SDK_OPENAI,
  AI_SDK_XAI,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';

// What each SDK package can put on the wire, which can lag the provider's API.
// A model's catalog entry lists what the model takes; only the intersection is
// offered, so a level the SDK would reject is never forwarded.
export const AI_SDK_PACKAGE_EFFORTS: Partial<
  Record<AiSdkPackage, readonly AiModelEffort[]>
> = {
  [AI_SDK_ANTHROPIC]: ['low', 'medium', 'high', 'xhigh', 'max'],
  [AI_SDK_BEDROCK]: ['low', 'medium', 'high', 'xhigh', 'max'],
  [AI_SDK_OPENAI]: ['none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'],
  [AI_SDK_AZURE]: ['none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'],
  [AI_SDK_GOOGLE]: ['minimal', 'low', 'medium', 'high'],
  [AI_SDK_MISTRAL]: ['none', 'high'],
  [AI_SDK_XAI]: ['low', 'high'],
};
