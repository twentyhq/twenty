import { MessageDeliveryStatus } from 'twenty-shared/types';

import { isMessageDeliveryStatusAhead } from 'src/engine/metadata-modules/message-channel/utils/is-message-delivery-status-ahead.util';

describe('isMessageDeliveryStatusAhead', () => {
  it('accepts any status on a message that has none', () => {
    expect(
      isMessageDeliveryStatusAhead({
        nextStatus: MessageDeliveryStatus.SENT,
        currentStatus: null,
      }),
    ).toBe(true);
  });

  it('moves a sent message forward to read', () => {
    expect(
      isMessageDeliveryStatusAhead({
        nextStatus: MessageDeliveryStatus.READ,
        currentStatus: MessageDeliveryStatus.SENT,
      }),
    ).toBe(true);
  });

  it.each([MessageDeliveryStatus.SENT, MessageDeliveryStatus.DELIVERED])(
    'keeps a read message read when %s arrives late',
    (nextStatus) => {
      expect(
        isMessageDeliveryStatusAhead({
          nextStatus,
          currentStatus: MessageDeliveryStatus.READ,
        }),
      ).toBe(false);
    },
  );

  it('ignores the same status twice', () => {
    expect(
      isMessageDeliveryStatusAhead({
        nextStatus: MessageDeliveryStatus.DELIVERED,
        currentStatus: MessageDeliveryStatus.DELIVERED,
      }),
    ).toBe(false);
  });
});
