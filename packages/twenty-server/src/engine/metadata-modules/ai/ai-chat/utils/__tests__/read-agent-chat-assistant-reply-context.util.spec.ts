import { type JSONValue } from 'ai';

import { buildAgentChatAssistantReplyProviderMetadata } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-assistant-reply-provider-metadata.util';
import { readAgentChatAssistantReplyContext } from 'src/engine/metadata-modules/ai/ai-chat/utils/read-agent-chat-assistant-reply-context.util';

describe('readAgentChatAssistantReplyContext', () => {
  it.each([
    {
      isAssistantMentioned: false,
      isDirectAssistantChat: false,
      isStructuredRequestContinuation: false,
    },
    {
      isAssistantMentioned: true,
      isDirectAssistantChat: false,
      isStructuredRequestContinuation: false,
    },
    {
      isAssistantMentioned: false,
      isDirectAssistantChat: true,
      isStructuredRequestContinuation: false,
    },
    {
      isAssistantMentioned: false,
      isDirectAssistantChat: false,
      isStructuredRequestContinuation: true,
    },
  ])('reads persisted policy context %j', (context) => {
    expect(
      readAgentChatAssistantReplyContext([
        {
          type: 'text',
          providerMetadata:
            buildAgentChatAssistantReplyProviderMetadata(context) ?? null,
        },
      ]),
    ).toEqual(context);
  });

  it('leaves legacy text without policy provenance unclassified', () => {
    expect(
      readAgentChatAssistantReplyContext([
        { type: 'text', providerMetadata: null },
      ]),
    ).toBeUndefined();
  });

  const malformedContexts: JSONValue[] = [
    {
      isAssistantMentioned: 'true',
      isDirectAssistantChat: false,
      isStructuredRequestContinuation: false,
    },
    { isAssistantMentioned: true, isStructuredRequestContinuation: false },
    { isAssistantMentioned: true, isDirectAssistantChat: false },
    {
      isAssistantMentioned: true,
      isDirectAssistantChat: false,
      isStructuredRequestContinuation: 'true',
    },
  ];

  it.each(malformedContexts)(
    'rejects malformed policy provenance %j',
    (assistantReplyContext) => {
      expect(
        readAgentChatAssistantReplyContext([
          {
            type: 'text',
            providerMetadata: { twenty: { assistantReplyContext } },
          },
        ]),
      ).toBeUndefined();
    },
  );

  it('does not use tool metadata as the user message request', () => {
    expect(
      readAgentChatAssistantReplyContext([
        {
          type: 'tool-call',
          providerMetadata:
            buildAgentChatAssistantReplyProviderMetadata({
              isAssistantMentioned: true,
              isDirectAssistantChat: false,
              isStructuredRequestContinuation: false,
            }) ?? null,
        },
      ]),
    ).toBeUndefined();
  });
});
