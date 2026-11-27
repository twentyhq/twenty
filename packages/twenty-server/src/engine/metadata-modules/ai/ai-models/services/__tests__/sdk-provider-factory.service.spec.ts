import { type LanguageModelV4 } from '@ai-sdk/provider';

import { AI_SDK_GROQ } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.constant';
import { SdkProviderFactoryService } from 'src/engine/metadata-modules/ai/ai-models/services/sdk-provider-factory.service';

describe('SdkProviderFactoryService', () => {
  it('should send replayed reasoning to Groq under the field it accepts', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'chatcmpl-1',
          created: 0,
          model: 'openai/gpt-oss-120b',
          choices: [
            {
              index: 0,
              message: { role: 'assistant', content: 'violet' },
              finish_reason: 'stop',
            },
          ],
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    const model = new SdkProviderFactoryService()
      .createProvider('groq', {
        npm: AI_SDK_GROQ,
        baseUrl: 'https://api.groq.com/openai/v1',
        apiKey: 'test-key',
      })
      .createModel?.('openai/gpt-oss-120b') as LanguageModelV4;

    await model.doGenerate({
      prompt: [
        { role: 'user', content: [{ type: 'text', text: 'Find the word' }] },
        {
          role: 'assistant',
          content: [
            { type: 'reasoning', text: 'I should look it up' },
            {
              type: 'tool-call',
              toolCallId: 'call_1',
              toolName: 'find_word',
              input: {},
            },
          ],
        },
        {
          role: 'tool',
          content: [
            {
              type: 'tool-result',
              toolCallId: 'call_1',
              toolName: 'find_word',
              output: { type: 'text', value: 'violet' },
            },
          ],
        },
      ],
    });

    const [url, init] = fetchSpy.mock.calls[0];
    const assistantMessage = JSON.parse(init?.body as string).messages[1];

    fetchSpy.mockRestore();

    expect(url).toBe('https://api.groq.com/openai/v1/chat/completions');
    expect(assistantMessage).not.toHaveProperty('reasoning_content');
    expect(assistantMessage.reasoning).toBe('I should look it up');
  });
});
