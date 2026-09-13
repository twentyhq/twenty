import {
  AI_SDK_PACKAGES,
  type AiSdkPackage,
} from '../constants/ai-sdk-packages.const';

// models.dev names a vendor the way the AI SDK names its package for most of
// the ones we bundle, so a vendor we have a package for is served by it and
// everything else goes through the compatible shim.
export const inferAiSdkPackage = (providerId: string): AiSdkPackage =>
  (AI_SDK_PACKAGES as readonly string[]).includes(`@ai-sdk/${providerId}`)
    ? (`@ai-sdk/${providerId}` as AiSdkPackage)
    : '@ai-sdk/openai-compatible';
