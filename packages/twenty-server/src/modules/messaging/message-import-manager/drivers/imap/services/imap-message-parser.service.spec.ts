import { type FetchMessageObject, type ImapFlow } from 'imapflow';

import { ImapMessageParserService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-message-parser.service';

const INTERNAL_DATE = new Date('2026-08-31T12:00:00.000Z');

describe('ImapMessageParserService', () => {
  it('should preserve the IMAP internal date when parsing a message', async () => {
    const release = jest.fn();
    const fetchAll = jest.fn().mockResolvedValue([
      {
        uid: 1,
        source: Buffer.from(
          [
            'From: Sender <sender@example.com>',
            'To: Recipient <recipient@example.com>',
            'Subject: Message without a date header',
            'Message-ID: <message-1@example.com>',
            '',
            'Message body',
          ].join('\r\n'),
        ),
        flags: new Set<string>(),
        internalDate: INTERNAL_DATE,
      } satisfies Partial<FetchMessageObject>,
    ]);
    const client = {
      mailbox: { uidValidity: BigInt(1) },
      getMailboxLock: jest.fn().mockResolvedValue({ release }),
      fetchAll,
    } as unknown as ImapFlow;
    const service = new ImapMessageParserService();

    const result = await service.parseMessagesFromFolder([1], 'INBOX', client);

    expect(fetchAll).toHaveBeenCalledWith(
      '1',
      { uid: true, source: true, flags: true, internalDate: true },
      { uid: true },
    );
    expect(result.messages[0].internalDate).toEqual(INTERNAL_DATE);
    expect(result.messages[0].parsed?.date).toBeUndefined();
    expect(release).toHaveBeenCalledTimes(1);
  });
});
