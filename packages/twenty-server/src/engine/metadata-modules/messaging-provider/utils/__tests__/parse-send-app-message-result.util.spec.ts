import { parseSendAppMessageResult } from 'src/engine/metadata-modules/messaging-provider/utils/parse-send-app-message-result.util';

describe('parseSendAppMessageResult', () => {
  it('returns the trimmed external id with the send time', () => {
    expect(
      parseSendAppMessageResult({
        externalId: ' message-a ',
        sentAt: '2026-10-23T09:30:00.000Z',
      }),
    ).toEqual({
      isValid: true,
      sentMessage: {
        externalId: 'message-a',
        sentAt: '2026-10-23T09:30:00.000Z',
      },
    });
  });

  it.each([
    ['an ISO time without offset', '2026-10-23T09:30:00', true],
    ['an epoch in milliseconds', 1792747800000, true],
    ['an epoch in seconds', 1792747800, true],
    ['a time that is not a date', 'today', false],
  ])(
    'accepts %s as the send time, or leaves it out',
    (_label, sentAt, isKept) => {
      const result = parseSendAppMessageResult({
        externalId: 'message-a',
        sentAt,
      });

      expect(result.isValid).toBe(true);
      expect(result.isValid && 'sentAt' in result.sentMessage).toBe(isKept);
    },
  );

  it('reads an epoch in seconds as seconds', () => {
    expect(
      parseSendAppMessageResult({
        externalId: 'message-a',
        sentAt: 1792747800,
      }),
    ).toEqual({
      isValid: true,
      sentMessage: {
        externalId: 'message-a',
        sentAt: new Date(1792747800000).toISOString(),
      },
    });
  });

  it('leaves the send time out when it is absent or null', () => {
    expect(
      parseSendAppMessageResult({ externalId: 'message-a', sentAt: null }),
    ).toEqual({ isValid: true, sentMessage: { externalId: 'message-a' } });
  });

  it.each([
    ['a missing result', undefined],
    ['a null result', null],
    ['a missing id', {}],
    ['a blank id', { externalId: '  ' }],
    ['an id over 512 characters', { externalId: 'a'.repeat(513) }],
  ])('rejects %s', (_label, data) => {
    expect(parseSendAppMessageResult(data)).toEqual({
      isValid: false,
      reason: expect.any(String),
    });
  });
});
