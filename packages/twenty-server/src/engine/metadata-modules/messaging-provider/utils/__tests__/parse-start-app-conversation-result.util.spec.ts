import { parseStartAppConversationResult } from 'src/engine/metadata-modules/messaging-provider/utils/parse-start-app-conversation-result.util';

const PERSON_ID = '20202020-0000-4000-8000-000000000001';

describe('parseStartAppConversationResult', () => {
  it('returns the sent message with its new thread and recipient handles', () => {
    expect(
      parseStartAppConversationResult({
        externalId: ' message-a ',
        threadExternalId: ' chat-a ',
        sentAt: '2026-10-23T09:30:00.000Z',
        recipients: [
          { personId: PERSON_ID, handle: 'https://linkedin.com/in/ada' },
        ],
      }),
    ).toEqual({
      isValid: true,
      startedConversation: {
        externalId: 'message-a',
        threadExternalId: 'chat-a',
        sentAt: '2026-10-23T09:30:00.000Z',
        recipients: [
          { personId: PERSON_ID, handle: 'https://linkedin.com/in/ada' },
        ],
      },
    });
  });

  it('leaves the recipients out when the app does not return any', () => {
    expect(
      parseStartAppConversationResult({
        externalId: 'message-a',
        threadExternalId: 'chat-a',
      }),
    ).toEqual({
      isValid: true,
      startedConversation: {
        externalId: 'message-a',
        threadExternalId: 'chat-a',
      },
    });
  });

  it.each([
    ['a missing result', undefined],
    ['a missing message id', { threadExternalId: 'chat-a' }],
    ['a missing thread id', { externalId: 'message-a' }],
    ['a blank thread id', { externalId: 'message-a', threadExternalId: ' ' }],
    [
      'a recipient that is not a person id',
      {
        externalId: 'message-a',
        threadExternalId: 'chat-a',
        recipients: [{ personId: 'ada', handle: 'ada' }],
      },
    ],
    [
      'a recipient without a handle',
      {
        externalId: 'message-a',
        threadExternalId: 'chat-a',
        recipients: [{ personId: PERSON_ID, handle: '' }],
      },
    ],
  ])('rejects %s', (_label, data) => {
    expect(parseStartAppConversationResult(data)).toEqual({
      isValid: false,
      reason: expect.any(String),
    });
  });
});
