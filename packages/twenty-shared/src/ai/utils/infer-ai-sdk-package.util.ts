import { type AiSdkPackage } from '../constants/ai-sdk-packages.const';
import { NATIVE_AI_SDK_PROVIDER_IDS } from '../constants/native-ai-sdk-provider-ids.const';

export const inferAiSdkPackage = (providerId: string): AiSdkPackage =>
  (NATIVE_AI_SDK_PROVIDER_IDS as readonly string[]).includes(providerId)
    ? (`@ai-sdk/${providerId}` as AiSdkPackage)
    : '@ai-sdk/openai-compatible';
