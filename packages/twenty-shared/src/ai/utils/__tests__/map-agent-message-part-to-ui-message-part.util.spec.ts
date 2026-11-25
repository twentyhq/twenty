import { mapAgentMessagePartToUIMessagePart } from '@/ai/utils/map-agent-message-part-to-ui-message-part.util';

describe('mapAgentMessagePartToUIMessagePart', () => {
  it('preserves OpenAI encrypted reasoning metadata', () => {
    const providerMetadata = {
      openai: {
        itemId: 'rs_123',
        reasoningEncryptedContent: 'encrypted-content',
      },
    };

    expect(
      mapAgentMessagePartToUIMessagePart({
        type: 'reasoning',
        reasoningContent: 'reasoning summary',
        orderIndex: 0,
        state: 'done',
        providerMetadata,
      }),
    ).toEqual({
      type: 'reasoning',
      text: 'reasoning summary',
      state: 'done',
      providerMetadata,
    });
  });

  it('maps reasoning stored without content to empty text', () => {
    expect(
      mapAgentMessagePartToUIMessagePart({
        type: 'reasoning',
        reasoningContent: null,
        orderIndex: 0,
        state: 'done',
      }),
    ).toMatchObject({ type: 'reasoning', text: '' });
  });
});
