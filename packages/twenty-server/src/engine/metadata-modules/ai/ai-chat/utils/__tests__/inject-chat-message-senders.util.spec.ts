import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { injectChatMessageSenders } from 'src/engine/metadata-modules/ai/ai-chat/utils/inject-chat-message-senders.util';

it('distinguishes the current sender from historical participants without relabeling assistant or hidden context', () => {
  const messages: ExtendedUIMessage[] = [
    {
      id: 'first',
      role: 'user',
      metadata: {
        createdAt: '2026-09-22T00:00:00.000Z',
        senderUserWorkspaceId: 'alice',
      },
      parts: [{ type: 'text', text: 'My records' }],
    },
    { id: 'reply', role: 'assistant', parts: [{ type: 'text', text: 'Done' }] },
    {
      id: 'hidden',
      role: 'user',
      parts: [{ type: 'text', text: 'Setup context' }],
    },
    {
      id: 'next',
      role: 'user',
      metadata: {
        createdAt: '2026-09-22T00:00:00.000Z',
        senderUserWorkspaceId: 'bob',
      },
      parts: [{ type: 'text', text: 'Now my records' }],
    },
  ];
  const result = injectChatMessageSenders({
    messages,
    currentUserWorkspaceId: 'bob',
  });
  expect(result[0].parts[0]).toEqual({
    type: 'text',
    text: '<message_sender>{"userWorkspaceId":"alice","isCurrentSender":false}</message_sender>',
  });
  expect(result[3].parts[0]).toEqual({
    type: 'text',
    text: '<message_sender>{"userWorkspaceId":"bob","isCurrentSender":true}</message_sender>',
  });
  expect(result[1]).toEqual(messages[1]);
  expect(result[2]).toEqual(messages[2]);
  expect(messages[0].parts).toHaveLength(1);
});
