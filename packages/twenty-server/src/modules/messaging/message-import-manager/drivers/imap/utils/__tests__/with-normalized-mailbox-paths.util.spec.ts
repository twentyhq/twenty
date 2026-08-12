import { type ImapFlow } from 'imapflow';

import { withNormalizedMailboxPaths } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/with-normalized-mailbox-paths.util';

const NFD_PATH = 'Ane\u0301mo';
const NFC_PATH = 'An\u00e9mo';

const createWrappedClient = (enabled: Set<string>) => {
  const mocks = {
    getMailboxLock: jest.fn().mockResolvedValue({ release: jest.fn() }),
    status: jest.fn().mockResolvedValue({}),
    append: jest.fn().mockResolvedValue({}),
    mailboxCreate: jest.fn().mockResolvedValue({}),
    list: jest.fn().mockResolvedValue([
      { path: NFD_PATH, parentPath: '' },
      { path: `Parent/${NFD_PATH}`, parentPath: NFD_PATH },
    ]),
  };
  const client = withNormalizedMailboxPaths({
    enabled,
    ...mocks,
  } as unknown as ImapFlow);

  return { client, mocks };
};

describe('withNormalizedMailboxPaths', () => {
  describe('on a UTF8=ACCEPT session', () => {
    it('sends the NFC form on SELECT, STATUS, APPEND and CREATE', async () => {
      const { client, mocks } = createWrappedClient(new Set(['UTF8=ACCEPT']));

      await client.getMailboxLock(NFD_PATH);
      await client.status(NFD_PATH, { uidNext: true });
      await client.append(NFD_PATH, Buffer.from('x'));
      await client.mailboxCreate(NFD_PATH);

      expect(mocks.getMailboxLock).toHaveBeenCalledWith(NFC_PATH, undefined);
      expect(mocks.status).toHaveBeenCalledWith(NFC_PATH, { uidNext: true });
      expect(mocks.append).toHaveBeenCalledWith(
        NFC_PATH,
        expect.any(Buffer),
        undefined,
        undefined,
      );
      expect(mocks.mailboxCreate).toHaveBeenCalledWith(NFC_PATH);
    });

    it('returns NFC paths and parentPaths from LIST', async () => {
      const { client } = createWrappedClient(new Set(['UTF8=ACCEPT']));

      const mailboxes = await client.list();

      expect(mailboxes.map((mailbox) => mailbox.path)).toEqual([
        NFC_PATH,
        `Parent/${NFC_PATH}`,
      ]);
      expect(mailboxes[1].parentPath).toBe(NFC_PATH);
    });
  });

  describe('on a legacy session without UTF8=ACCEPT', () => {
    it('keeps paths byte-exact in both directions', async () => {
      const { client, mocks } = createWrappedClient(new Set());

      await client.getMailboxLock(NFD_PATH);
      const mailboxes = await client.list();

      expect(mocks.getMailboxLock).toHaveBeenCalledWith(NFD_PATH, undefined);
      expect(mailboxes[0].path).toBe(NFD_PATH);
    });
  });
});
