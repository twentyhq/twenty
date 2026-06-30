import {
  AI_SDK_PACKAGES,
  type AiSdkPackage,
} from '../constants/ai-sdk-packages.const';

export const isAiSdkPackage = (value: string): value is AiSdkPackage =>
  (AI_SDK_PACKAGES as readonly string[]).includes(value);
