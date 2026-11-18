import { computeAppMessageThreadReadStateUpdate } from 'src/engine/metadata-modules/message-channel/utils/compute-app-message-thread-read-state-update.util';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';

const aThreadMessage = ({
  associationId,
  isRead,
  direction = MessageDirection.INCOMING,
  receivedAt,
}: {
  associationId: string;
  isRead: boolean;
  direction?: MessageDirection;
  receivedAt: string;
}) => ({
  associationId,
  isRead,
  direction,
  receivedAt: new Date(receivedAt),
});

describe('computeAppMessageThreadReadStateUpdate', () => {
  it('marks every unread message read', () => {
    expect(
      computeAppMessageThreadReadStateUpdate({
        isRead: true,
        threadMessages: [
          aThreadMessage({
            associationId: 'first',
            isRead: false,
            receivedAt: '2026-10-20T10:00:00.000Z',
          }),
          aThreadMessage({
            associationId: 'second',
            isRead: true,
            receivedAt: '2026-10-20T10:01:00.000Z',
          }),
          aThreadMessage({
            associationId: 'third',
            isRead: false,
            receivedAt: '2026-10-20T10:02:00.000Z',
          }),
        ],
      }),
    ).toEqual(['first', 'third']);
  });

  it('marks only the latest incoming message unread', () => {
    expect(
      computeAppMessageThreadReadStateUpdate({
        isRead: false,
        threadMessages: [
          aThreadMessage({
            associationId: 'older-incoming',
            isRead: true,
            receivedAt: '2026-10-20T10:00:00.000Z',
          }),
          aThreadMessage({
            associationId: 'latest-incoming',
            isRead: true,
            receivedAt: '2026-10-20T10:01:00.000Z',
          }),
          aThreadMessage({
            associationId: 'outgoing',
            isRead: true,
            direction: MessageDirection.OUTGOING,
            receivedAt: '2026-10-20T10:02:00.000Z',
          }),
        ],
      }),
    ).toEqual(['latest-incoming']);
  });

  it('changes nothing when the thread is already unread', () => {
    expect(
      computeAppMessageThreadReadStateUpdate({
        isRead: false,
        threadMessages: [
          aThreadMessage({
            associationId: 'unread-incoming',
            isRead: false,
            receivedAt: '2026-10-20T10:00:00.000Z',
          }),
          aThreadMessage({
            associationId: 'latest-incoming',
            isRead: true,
            receivedAt: '2026-10-20T10:01:00.000Z',
          }),
        ],
      }),
    ).toEqual([]);
  });

  it('changes nothing when the thread has no incoming message', () => {
    expect(
      computeAppMessageThreadReadStateUpdate({
        isRead: false,
        threadMessages: [
          aThreadMessage({
            associationId: 'outgoing',
            isRead: true,
            direction: MessageDirection.OUTGOING,
            receivedAt: '2026-10-20T10:00:00.000Z',
          }),
        ],
      }),
    ).toEqual([]);
  });
});
