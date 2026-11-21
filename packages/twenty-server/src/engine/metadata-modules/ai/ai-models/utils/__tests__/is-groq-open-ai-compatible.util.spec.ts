import {
  AI_SDK_OPENAI,
  AI_SDK_OPENAI_COMPATIBLE,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.constant';
import { isGroqOpenAiCompatible } from 'src/engine/metadata-modules/ai/ai-models/utils/is-groq-open-ai-compatible.util';

describe('isGroqOpenAiCompatible', () => {
  it('returns true when npm is openai-compatible and baseUrl contains groq.com', () => {
    expect(
      isGroqOpenAiCompatible({
        npm: AI_SDK_OPENAI_COMPATIBLE,
        baseUrl: 'https://api.groq.com/openai/v1',
      }),
    ).toBe(true);

    expect(
      isGroqOpenAiCompatible({
        npm: AI_SDK_OPENAI_COMPATIBLE,
        baseUrl: 'https://api.groq.com',
      }),
    ).toBe(true);
  });

  it('returns true when npm is openai-compatible and name is groq or starts with groq-', () => {
    expect(
      isGroqOpenAiCompatible({
        npm: AI_SDK_OPENAI_COMPATIBLE,
        name: 'groq',
        baseUrl: 'https://proxy.internal/v1',
      }),
    ).toBe(true);

    expect(
      isGroqOpenAiCompatible({
        npm: AI_SDK_OPENAI_COMPATIBLE,
        name: 'groq-self-hosted',
        baseUrl: 'https://proxy.internal/v1',
      }),
    ).toBe(true);
  });

  it('returns true when config.name is unset but providerName indicates groq', () => {
    expect(
      isGroqOpenAiCompatible(
        {
          npm: AI_SDK_OPENAI_COMPATIBLE,
          baseUrl: 'https://proxy.internal/v1',
        },
        'groq',
      ),
    ).toBe(true);

    expect(
      isGroqOpenAiCompatible(
        {
          npm: AI_SDK_OPENAI_COMPATIBLE,
          baseUrl: 'https://proxy.internal/v1',
        },
        'groq-proxy',
      ),
    ).toBe(true);
  });

  it('returns false for other OpenAI-compatible providers', () => {
    expect(
      isGroqOpenAiCompatible({
        npm: AI_SDK_OPENAI_COMPATIBLE,
        baseUrl: 'https://api.deepseek.com/v1',
        name: 'deepseek',
      }),
    ).toBe(false);

    expect(
      isGroqOpenAiCompatible({
        npm: AI_SDK_OPENAI_COMPATIBLE,
        baseUrl: 'https://api.together.xyz/v1',
      }),
    ).toBe(false);
  });

  it('returns false when npm is not openai-compatible even if baseUrl contains groq', () => {
    expect(
      isGroqOpenAiCompatible({
        npm: AI_SDK_OPENAI,
        baseUrl: 'https://api.groq.com/openai/v1',
      }),
    ).toBe(false);
  });
});
