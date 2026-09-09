import {
  AI_SDK_ANTHROPIC,
  AI_SDK_BEDROCK,
  AI_SDK_OPENAI,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';
import { buildReasoningProviderOptions } from 'src/engine/metadata-modules/ai/ai-models/utils/build-reasoning-provider-options.util';

describe('buildReasoningProviderOptions', () => {
  it('sends Anthropic adaptive thinking under the key it reads', () => {
    expect(
      buildReasoningProviderOptions({
        modelId: 'anthropic/claude-opus-5',
        sdkPackage: AI_SDK_ANTHROPIC,
        supportsReasoning: true,
      }),
    ).toEqual({ anthropic: { thinking: { type: 'adaptive' } } });
  });

  it('sends Bedrock adaptive thinking under the key it reads', () => {
    expect(
      buildReasoningProviderOptions({
        modelId: 'amazon-bedrock/eu.anthropic.claude-opus-4-7',
        sdkPackage: AI_SDK_BEDROCK,
        supportsReasoning: true,
      }),
    ).toEqual({ bedrock: { reasoningConfig: { type: 'adaptive' } } });
  });

  it('leaves a Claude model older than 4.6 without thinking', () => {
    expect(
      buildReasoningProviderOptions({
        modelId: 'anthropic/claude-haiku-4-5-20251001',
        sdkPackage: AI_SDK_ANTHROPIC,
        supportsReasoning: true,
      }),
    ).toEqual({});
  });

  it('sends nothing to a Bedrock model that is not Claude', () => {
    expect(
      buildReasoningProviderOptions({
        modelId: 'amazon-bedrock/us.deepseek.r1-v1:0',
        sdkPackage: AI_SDK_BEDROCK,
        supportsReasoning: true,
      }),
    ).toEqual({});
  });

  it('sends nothing to a model that does not reason', () => {
    expect(
      buildReasoningProviderOptions({
        modelId: 'anthropic/claude-opus-5',
        sdkPackage: AI_SDK_ANTHROPIC,
        supportsReasoning: false,
      }),
    ).toEqual({});
  });

  it('sends nothing to providers without a reasoning config', () => {
    expect(
      buildReasoningProviderOptions({
        modelId: 'openai/gpt-5.6-sol',
        sdkPackage: AI_SDK_OPENAI,
        supportsReasoning: true,
      }),
    ).toEqual({});
  });
});
