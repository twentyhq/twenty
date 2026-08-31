import { type ImapFlow } from 'imapflow';
import PostalMime from 'postal-mime';

import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { ImapGetMessagesService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-get-messages.service';
import { ImapMessageParserService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-message-parser.service';
import { ImapMessagesImportErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-messages-import-error-handler.service';

const INTERNAL_DATE = new Date('2026-08-31T12:00:00.000Z');

describe('ImapGetMessagesService', () => {
  it('should fall back to the IMAP internal date when the Date header is missing', async () => {
    const parsedMessage = await PostalMime.parse(
      Buffer.from(
        [
          'From: Sender <sender@example.com>',
          'To: Recipient <recipient@example.com>',
          'Subject: Message without a date header',
          'Message-ID: <message-1@example.com>',
          '',
          'Message body',
        ].join('\r\n'),
      ),
    );
    const client = {} as ImapFlow;
    const imapClientProvider = {
      getClient: jest.fn().mockResolvedValue(client),
      closeClient: jest.fn().mockResolvedValue(undefined),
    } as unknown as ImapClientProvider;
    const messageParser = {
      parseMessagesFromFolder: jest.fn().mockResolvedValue({
        messages: [
          {
            uid: 1,
            parsed: parsedMessage,
            internalDate: INTERNAL_DATE,
          },
        ],
        uidValidity: BigInt(1),
      }),
    } as unknown as ImapMessageParserService;
    const errorHandler = {
      handleError: jest.fn(),
    } as unknown as ImapMessagesImportErrorHandler;
    const service = new ImapGetMessagesService(
      imapClientProvider,
      messageParser,
      errorHandler,
    );

    const messages = await service.getMessages(['INBOX:1'], {
      id: 'connected-account-id',
      handle: 'recipient@example.com',
      handleAliases: [],
    });

    expect(parsedMessage.date).toBeUndefined();
    expect(messages).toHaveLength(1);
    expect(messages[0].receivedAt).toEqual(INTERNAL_DATE);
    expect(imapClientProvider.closeClient).toHaveBeenCalledWith(client);
  });
});
