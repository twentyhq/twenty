import { Test, TestingModule } from '@nestjs/testing';

import { ImapFlow } from 'imapflow';
import { ConnectedAccountProvider } from 'twenty-shared/types';

import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { ImapGetMessagesService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-get-messages.service';
import { ImapMessageParserService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-message-parser.service';
import { ImapMessageTextExtractorService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-message-text-extractor.service';
import { ImapMessagesImportErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-messages-import-error-handler.service';

describe('ImapGetMessagesService', () => {
  let service: ImapGetMessagesService;
  let mockImapClientProvider: Partial<ImapClientProvider>;
  let mockMessageParser: Partial<ImapMessageParserService>;
  let mockTextExtractor: Partial<ImapMessageTextExtractorService>;
  let mockErrorHandler: Partial<ImapMessagesImportErrorHandler>;

  const MOCK_CONNECTED_ACCOUNT = {
    id: 'ca-id',
    provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
    handle: 'test@example.com',
    handleAliases: ['alias@example.com'],
    connectionParameters: {},
  };

  beforeEach(async () => {
    mockImapClientProvider = {
      getClient: jest.fn().mockResolvedValue({} as ImapFlow),
      closeClient: jest.fn().mockResolvedValue(undefined),
    };
    mockMessageParser = {
      parseMessagesFromFolder: jest.fn(),
    };
    mockTextExtractor = {
      extractTextWithoutReplyQuotations: jest.fn().mockReturnValue('Parsed text'),
    };
    mockErrorHandler = {
      handleError: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImapGetMessagesService,
        { provide: ImapClientProvider, useValue: mockImapClientProvider },
        { provide: ImapMessageParserService, useValue: mockMessageParser },
        {
          provide: ImapMessageTextExtractorService,
          useValue: mockTextExtractor,
        },
        {
          provide: ImapMessagesImportErrorHandler,
          useValue: mockErrorHandler,
        },
      ],
    }).compile();

    service = module.get<ImapGetMessagesService>(ImapGetMessagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return empty array if no messageExternalIds are provided', async () => {
    const result = await service.getMessages([], MOCK_CONNECTED_ACCOUNT);
    expect(result).toEqual([]);
    expect(mockImapClientProvider.getClient).not.toHaveBeenCalled();
  });

  it('should group messages by folder and fetch from all folders', async () => {
    const messageExternalIds = ['INBOX:1', 'SENT:2', 'INBOX:3'];
    const mockParsedMessage = {
      messageId: 'mid-1',
      subject: 'Test Subject',
      date: new Date().toISOString(),
      from: [{ address: 'sender@external.com', name: 'Sender' }],
      to: [{ address: 'test@example.com', name: 'Test' }],
      attachments: [
        { filename: 'file.txt', content: Buffer.from('test'), contentType: 'text/plain' },
      ],
    };

    (mockMessageParser.parseMessagesFromFolder as jest.Mock).mockImplementation(
      (uids, folderPath) => {
        if (folderPath === 'INBOX') {
          return [
            { uid: 1, parsed: mockParsedMessage },
            { uid: 3, parsed: mockParsedMessage },
          ];
        }
        if (folderPath === 'SENT') {
          return [{ uid: 2, parsed: mockParsedMessage }];
        }
        return [];
      },
    );

    const result = await service.getMessages(
      messageExternalIds,
      MOCK_CONNECTED_ACCOUNT,
    );

    expect(mockImapClientProvider.getClient).toHaveBeenCalled();
    expect(mockMessageParser.parseMessagesFromFolder).toHaveBeenCalledTimes(2);
    expect(mockMessageParser.parseMessagesFromFolder).toHaveBeenCalledWith(
      [1, 3],
      'INBOX',
      expect.anything(),
    );
    expect(mockMessageParser.parseMessagesFromFolder).toHaveBeenCalledWith(
      [2],
      'SENT',
      expect.anything(),
    );
    expect(result.length).toBe(3);
    expect(result[0].attachments.length).toBe(1);
    expect(result[0].attachments[0].content).toEqual(Buffer.from('test'));
    expect(result[0].attachments[0].contentType).toEqual('text/plain');
  });

  it('should handle parsing errors and continue with other messages', async () => {
    const messageExternalIds = ['INBOX:1', 'INBOX:2'];
    const mockParsedMessage = {
      messageId: 'mid-1',
      subject: 'Test Subject',
      date: new Date().toISOString(),
      from: [{ address: 'sender@external.com', name: 'Sender' }],
      to: [{ address: 'test@example.com', name: 'Test' }],
      attachments: [],
    };

    (mockMessageParser.parseMessagesFromFolder as jest.Mock).mockResolvedValue([
      { uid: 1, parsed: mockParsedMessage },
      { uid: 2, parsed: null, error: new Error('Parsing failed') },
    ]);

    const result = await service.getMessages(
      messageExternalIds,
      MOCK_CONNECTED_ACCOUNT,
    );

    expect(result.length).toBe(1);
    expect(mockErrorHandler.handleError).toHaveBeenCalled();
  });
});
