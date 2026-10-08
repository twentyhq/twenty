import { getExpungedMessageUids } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/get-expunged-message-uids.util';

describe('getExpungedMessageUids', () => {
  it('returns known UIDs that are no longer on the server', () => {
    expect(
      getExpungedMessageUids({
        knownMessageUids: [2884, 2886, 2889, 2891, 2893],
        serverMessageUids: [2893],
      }),
    ).toEqual([2884, 2886, 2889, 2891]);
  });

  it('ignores server UIDs that were never imported', () => {
    expect(
      getExpungedMessageUids({
        knownMessageUids: [1, 3],
        serverMessageUids: [1, 2, 3, 4],
      }),
    ).toEqual([]);
  });

  it('returns every known UID when the server folder is empty', () => {
    expect(
      getExpungedMessageUids({
        knownMessageUids: [5, 6],
        serverMessageUids: [],
      }),
    ).toEqual([5, 6]);
  });
});
