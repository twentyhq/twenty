import {
  AI_SDK_ANTHROPIC,
  AI_SDK_GOOGLE,
  AI_SDK_MISTRAL,
  AI_SDK_OPENAI,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.constant';
import { buildAiSearchAnswerProviderOptions } from 'src/engine/metadata-modules/ai/ai-search-answer/utils/build-ai-search-answer-provider-options.util';

describe('buildAiSearchAnswerProviderOptions', () => {
  it('turns reasoning off for reasoning models', () => {
    expect(
      buildAiSearchAnswerProviderOptions({
        sdkPackage: AI_SDK_GOOGLE,
        supportsReasoning: true,
      }),
    ).toEqual({ google: { thinkingConfig: { thinkingBudget: 0 } } });
    expect(
      buildAiSearchAnswerProviderOptions({
        sdkPackage: AI_SDK_OPENAI,
        supportsReasoning: true,
      }),
    ).toEqual({ openai: { reasoningEffort: 'minimal' } });
    expect(
      buildAiSearchAnswerProviderOptions({
        sdkPackage: AI_SDK_ANTHROPIC,
        supportsReasoning: true,
      }),
    ).toEqual({ anthropic: { thinking: { type: 'disabled' } } });
  });

  it('sends nothing for models without reasoning or unknown providers', () => {
    expect(
      buildAiSearchAnswerProviderOptions({
        sdkPackage: AI_SDK_OPENAI,
        supportsReasoning: false,
      }),
    ).toEqual({});
    expect(
      buildAiSearchAnswerProviderOptions({
        sdkPackage: AI_SDK_MISTRAL,
        supportsReasoning: true,
      }),
    ).toEqual({});
  });
});
