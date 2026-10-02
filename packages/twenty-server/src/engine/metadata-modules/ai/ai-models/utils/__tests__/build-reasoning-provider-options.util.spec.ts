import {
  AI_SDK_ANTHROPIC,
  AI_SDK_AZURE,
  AI_SDK_BEDROCK,
  AI_SDK_GOOGLE,
  AI_SDK_MISTRAL,
  AI_SDK_OPENAI,
  AI_SDK_XAI,
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

  it('adds the pinned effort next to Anthropic thinking', () => {
    expect(
      buildReasoningProviderOptions({
        modelId: 'anthropic/claude-opus-5@low',
        sdkPackage: AI_SDK_ANTHROPIC,
        supportsReasoning: true,
        effort: 'low',
      }),
    ).toEqual({
      anthropic: { thinking: { type: 'adaptive' }, effort: 'low' },
    });
  });

  it('sends an Anthropic effort on its own to a model without adaptive thinking', () => {
    expect(
      buildReasoningProviderOptions({
        modelId: 'anthropic/claude-opus-4-5@medium',
        sdkPackage: AI_SDK_ANTHROPIC,
        supportsReasoning: true,
        effort: 'medium',
      }),
    ).toEqual({ anthropic: { effort: 'medium' } });
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

  it('caps Bedrock reasoning at the pinned effort', () => {
    expect(
      buildReasoningProviderOptions({
        modelId: 'amazon-bedrock/eu.anthropic.claude-opus-4-7@high',
        sdkPackage: AI_SDK_BEDROCK,
        supportsReasoning: true,
        effort: 'high',
      }),
    ).toEqual({
      bedrock: {
        reasoningConfig: { type: 'adaptive', maxReasoningEffort: 'high' },
      },
    });
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

  it('sends nothing to a provider without a pinned effort', () => {
    expect(
      buildReasoningProviderOptions({
        modelId: 'openai/gpt-5.6-sol',
        sdkPackage: AI_SDK_OPENAI,
        supportsReasoning: true,
      }),
    ).toEqual({});
  });

  it.each([
    [
      AI_SDK_OPENAI,
      'openai/gpt-5.6-sol@xhigh',
      'xhigh',
      { openai: { reasoningEffort: 'xhigh' } },
    ],
    [
      AI_SDK_AZURE,
      'azure/gpt-5.6-sol@none',
      'none',
      { azure: { reasoningEffort: 'none' } },
    ],
    [
      AI_SDK_GOOGLE,
      'google/gemini-3.7-flash@low',
      'low',
      { google: { thinkingConfig: { thinkingLevel: 'low' } } },
    ],
    [
      AI_SDK_MISTRAL,
      'mistral/mistral-small-latest@none',
      'none',
      { mistral: { reasoningEffort: 'none' } },
    ],
    [
      AI_SDK_XAI,
      'xai/grok-4.6@high',
      'high',
      { xai: { reasoningEffort: 'high' } },
    ],
  ] as const)(
    'sends the pinned effort under the %s key',
    (sdkPackage, modelId, effort, expected) => {
      expect(
        buildReasoningProviderOptions({
          modelId,
          sdkPackage,
          supportsReasoning: true,
          effort,
        }),
      ).toEqual(expected);
    },
  );

  describe('with a reasoning summary', () => {
    it.each([
      [
        AI_SDK_OPENAI,
        'openai/gpt-5.6-sol',
        { openai: { reasoningSummary: 'auto' } },
      ],
      [
        AI_SDK_AZURE,
        'azure/gpt-5.6-sol',
        { azure: { reasoningSummary: 'auto' } },
      ],
      [
        AI_SDK_GOOGLE,
        'google/gemini-3.7-flash',
        { google: { thinkingConfig: { includeThoughts: true } } },
      ],
    ] as const)(
      'asks %s for a summary of its reasoning',
      (sdkPackage, modelId, expected) => {
        expect(
          buildReasoningProviderOptions(
            { modelId, sdkPackage, supportsReasoning: true },
            { shouldIncludeReasoningSummary: true },
          ),
        ).toEqual(expected);
      },
    );

    it('keeps the pinned effort next to the summary', () => {
      expect(
        buildReasoningProviderOptions(
          {
            modelId: 'google/gemini-3.7-flash@low',
            sdkPackage: AI_SDK_GOOGLE,
            supportsReasoning: true,
            effort: 'low',
          },
          { shouldIncludeReasoningSummary: true },
        ),
      ).toEqual({
        google: {
          thinkingConfig: { thinkingLevel: 'low', includeThoughts: true },
        },
      });
    });

    it('asks for no summary when reasoning is turned off', () => {
      expect(
        buildReasoningProviderOptions(
          {
            modelId: 'openai/gpt-5.6-sol@none',
            sdkPackage: AI_SDK_OPENAI,
            supportsReasoning: true,
            effort: 'none',
          },
          { shouldIncludeReasoningSummary: true },
        ),
      ).toEqual({ openai: { reasoningEffort: 'none' } });
    });

    it('asks nothing of a model that does not reason', () => {
      expect(
        buildReasoningProviderOptions(
          {
            modelId: 'openai/gpt-4.1',
            sdkPackage: AI_SDK_OPENAI,
            supportsReasoning: false,
          },
          { shouldIncludeReasoningSummary: true },
        ),
      ).toEqual({});
    });
  });
});
