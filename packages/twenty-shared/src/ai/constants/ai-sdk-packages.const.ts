export const AI_SDK_PACKAGES = [
  '@ai-sdk/openai',
  '@ai-sdk/anthropic',
  '@ai-sdk/google',
  '@ai-sdk/mistral',
  '@ai-sdk/xai',
  '@ai-sdk/amazon-bedrock',
  '@ai-sdk/openai-compatible',
] as const;

export type AiSdkPackage = (typeof AI_SDK_PACKAGES)[number];
