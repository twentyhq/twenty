import { EventMetadataException } from 'src/engine/metadata-modules/event-metadata/event-metadata.exception';
import { parseMemberEventSubscriptionsOrThrow } from 'src/engine/metadata-modules/event-metadata/utils/parse-member-event-subscriptions-or-throw.util';

const RECORD_ID = '0f5c2c1e-4b7a-4f3e-9d2a-6c8b1e0a7d34';

describe('parseMemberEventSubscriptionsOrThrow', () => {
  it('should return valid subscriptions', () => {
    expect(
      parseMemberEventSubscriptionsOrThrow({
        subscriptions: [
          { event: 'messageAdded', recordId: RECORD_ID },
          {
            event: 'messageAdded',
            recordId: RECORD_ID,
            property: 'conversationId',
          },
        ],
      }),
    ).toEqual([
      { event: 'messageAdded', recordId: RECORD_ID },
      {
        event: 'messageAdded',
        recordId: RECORD_ID,
        property: 'conversationId',
      },
    ]);
  });

  it.each([
    ['a missing body', undefined],
    ['no subscriptions', { subscriptions: [] }],
    [
      'a recordId that is not a UUID',
      { subscriptions: [{ event: 'messageAdded', recordId: 'record-1' }] },
    ],
    ['a missing event', { subscriptions: [{ recordId: RECORD_ID }] }],
    [
      'too many subscriptions',
      {
        subscriptions: Array.from({ length: 21 }, () => ({
          event: 'messageAdded',
          recordId: RECORD_ID,
        })),
      },
    ],
  ])('should reject %s', (_, body) => {
    expect(() => parseMemberEventSubscriptionsOrThrow(body)).toThrow(
      EventMetadataException,
    );
  });
});
