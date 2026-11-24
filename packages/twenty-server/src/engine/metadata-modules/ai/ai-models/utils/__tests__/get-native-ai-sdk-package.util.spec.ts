import {
  AI_SDK_GROQ,
  AI_SDK_OPENAI,
  AI_SDK_OPENAI_COMPATIBLE,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.constant';
import { getNativeAiSdkPackage } from 'src/engine/metadata-modules/ai/ai-models/utils/get-native-ai-sdk-package.util';

describe('getNativeAiSdkPackage', () => {
  it('should send an OpenAI-compatible Groq provider to the Groq SDK', () => {
    expect(
      getNativeAiSdkPackage({
        npm: AI_SDK_OPENAI_COMPATIBLE,
        baseUrl: 'https://api.groq.com/openai/v1',
      }),
    ).toBe(AI_SDK_GROQ);
  });

  it.each([
    [AI_SDK_OPENAI_COMPATIBLE, 'https://api.deepseek.com/v1'],
    [AI_SDK_OPENAI_COMPATIBLE, 'not a url'],
    [AI_SDK_OPENAI_COMPATIBLE, undefined],
    [AI_SDK_OPENAI, 'https://api.groq.com/openai/v1'],
  ] as const)('should keep %s for base URL %s', (npm, baseUrl) => {
    expect(getNativeAiSdkPackage({ npm, baseUrl })).toBe(npm);
  });
});
