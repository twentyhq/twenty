import {
  AI_SDK_PACKAGES,
  type AiSdkPackage,
} from '../constants/ai-sdk-packages.const';

// models.dev vendor ids match the AI SDK package names we bundle; anything else goes through the compatible shim.
export const inferAiSdkPackage = (providerId: string): AiSdkPackage =>
  (AI_SDK_PACKAGES as readonly string[]).includes(`@ai-sdk/${providerId}`)
    ? (`@ai-sdk/${providerId}` as AiSdkPackage)
    : '@ai-sdk/openai-compatible';
