import { type AiSdkPackage } from './ai-sdk-packages.const';

export const AI_SDK_PACKAGE_LABELS: Record<AiSdkPackage, string> = {
  '@ai-sdk/openai': 'OpenAI',
  '@ai-sdk/anthropic': 'Anthropic',
  '@ai-sdk/google': 'Google',
  '@ai-sdk/mistral': 'Mistral',
  '@ai-sdk/xai': 'xAI',
  '@ai-sdk/amazon-bedrock': 'AWS Bedrock',
  '@ai-sdk/openai-compatible': 'OpenAI-Compatible',
  '@ai-sdk/azure': 'Azure OpenAI',
};
