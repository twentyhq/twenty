import { type AmazonBedrockLanguageModelOptions } from '@ai-sdk/amazon-bedrock';
import { type AnthropicLanguageModelOptions } from '@ai-sdk/anthropic';
import { type GoogleLanguageModelOptions } from '@ai-sdk/google';
import { type MistralLanguageModelOptions } from '@ai-sdk/mistral';
import { type XaiLanguageModelResponsesOptions } from '@ai-sdk/xai';
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

type AnthropicEffort = NonNullable<AnthropicLanguageModelOptions['effort']>;
type BedrockEffort = NonNullable<
  NonNullable<
    AmazonBedrockLanguageModelOptions['reasoningConfig']
  >['maxReasoningEffort']
>;
type GoogleThinkingLevel = NonNullable<
  NonNullable<GoogleLanguageModelOptions['thinkingConfig']>['thinkingLevel']
>;
type MistralEffort = NonNullable<
  MistralLanguageModelOptions['reasoningEffort']
>;
type XaiEffort = NonNullable<
  XaiLanguageModelResponsesOptions['reasoningEffort']
>;

// intersected with each model's catalog efforts so a level the SDK would reject is never forwarded
export const AI_SDK_PACKAGE_EFFORTS: Partial<
  Record<AiSdkPackage, readonly AiModelEffort[]>
> = {
  [AI_SDK_ANTHROPIC]: [
    'low',
    'medium',
    'high',
    'xhigh',
    'max',
  ] satisfies readonly AnthropicEffort[],
  [AI_SDK_BEDROCK]: [
    'low',
    'medium',
    'high',
    'xhigh',
    'max',
  ] satisfies readonly BedrockEffort[],
  [AI_SDK_OPENAI]: ['none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'],
  [AI_SDK_AZURE]: ['none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'],
  [AI_SDK_GOOGLE]: [
    'minimal',
    'low',
    'medium',
    'high',
  ] satisfies readonly GoogleThinkingLevel[],
  [AI_SDK_MISTRAL]: ['none', 'high'] satisfies readonly MistralEffort[],
  [AI_SDK_XAI]: ['low', 'medium', 'high'] satisfies readonly XaiEffort[],
};
