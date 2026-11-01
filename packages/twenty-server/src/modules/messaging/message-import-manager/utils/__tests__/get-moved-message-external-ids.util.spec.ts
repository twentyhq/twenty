import { getMovedMessageExternalIds } from 'src/modules/messaging/message-import-manager/utils/get-moved-message-external-ids.util';

describe('getMovedMessageExternalIds', () => {
  it('returns messages that one folder removes while another folder returns them', () => {
    expect(
      getMovedMessageExternalIds({
        messageExternalIds: ['moved-message', 'new-message'],
        messageExternalIdsToDelete: ['moved-message', 'deleted-message'],
      }),
    ).toEqual(new Set(['moved-message']));
  });

  it('returns nothing when no message is both removed and returned', () => {
    expect(
      getMovedMessageExternalIds({
        messageExternalIds: ['new-message'],
        messageExternalIdsToDelete: ['deleted-message'],
      }),
    ).toEqual(new Set());
  });
});
