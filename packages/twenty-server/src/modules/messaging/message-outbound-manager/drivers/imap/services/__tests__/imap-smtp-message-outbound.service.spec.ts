import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { ImapFindDraftsFolderService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-find-drafts-folder.service';
import { SmtpClientProvider } from 'src/modules/messaging/message-import-manager/drivers/smtp/providers/smtp-client.provider';
import { ImapSmtpMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/drivers/imap/services/imap-smtp-message-outbound.service';

jest.mock('nodemailer/lib/mail-composer', () => {
  return jest.fn().mockImplementation(() => ({
    compile: jest.fn().mockReturnValue({
      build: jest
        .fn()
        .mockResolvedValue(
          Buffer.from(
            'Message-ID: <test-message-id@example.com>\r\nContent: test',
          ),
        ),
    }),
  }));
});

describe('ImapSmtpMessageOutboundService', () => {
  let service: ImapSmtpMessageOutboundService;

  const mockSmtpSendMail = jest.fn().mockResolvedValue({});
  const mockImapAppend = jest.fn().mockResolvedValue(undefined);
  const mockImapClient = { append: mockImapAppend };

  const connectedAccount = {
    id: 'account-1',
    handle: 'user@example.com',
    provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
    connectionParameters: {
      IMAP: { host: 'imap.example.com', port: 993 },
      SMTP: { host: 'smtp.example.com', port: 587 },
    },
  } as unknown as ConnectedAccountEntity;

  const messageChannel = {
    id: 'channel-1',
    connectedAccountId: 'account-1',
    handle: 'user@example.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImapSmtpMessageOutboundService,
        {
          provide: SmtpClientProvider,
          useValue: {
            getSmtpClient: jest
              .fn()
              .mockResolvedValue({ sendMail: mockSmtpSendMail }),
          },
        },
        {
          provide: ImapClientProvider,
          useValue: {
            getClient: jest.fn().mockResolvedValue(mockImapClient),
            closeClient: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: ImapFindDraftsFolderService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(MessageChannelEntity),
          useValue: {
            findOne: jest.fn().mockResolvedValue(messageChannel),
          },
        },
        {
          provide: getRepositoryToken(MessageFolderEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(ImapSmtpMessageOutboundService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should use full path from externalId for IMAP append', async () => {
    const messageFolderRepo = service['messageFolderRepository'];

    (messageFolderRepo.findOne as jest.Mock).mockResolvedValue({
      id: 'folder-1',
      name: 'Sent',
      externalId: 'INBOX.Sent:12345',
      isSentFolder: true,
    });

    await service.sendMessage(
      { to: 'recipient@example.com', subject: 'Test', body: 'Hello' },
      connectedAccount,
    );

    expect(mockImapAppend).toHaveBeenCalledWith(
      'INBOX.Sent',
      expect.any(Buffer),
    );
  });

  it('should fall back to name when externalId is null', async () => {
    const messageFolderRepo = service['messageFolderRepository'];

    (messageFolderRepo.findOne as jest.Mock).mockResolvedValue({
      id: 'folder-1',
      name: 'Sent',
      externalId: null,
      isSentFolder: true,
    });

    await service.sendMessage(
      { to: 'recipient@example.com', subject: 'Test', body: 'Hello' },
      connectedAccount,
    );

    expect(mockImapAppend).toHaveBeenCalledWith('Sent', expect.any(Buffer));
  });

  it('should not fail the send when IMAP append throws', async () => {
    const messageFolderRepo = service['messageFolderRepository'];

    (messageFolderRepo.findOne as jest.Mock).mockResolvedValue({
      id: 'folder-1',
      name: 'Sent',
      externalId: 'Sent:12345',
      isSentFolder: true,
    });

    mockImapAppend.mockRejectedValueOnce(new Error('Command failed'));

    const result = await service.sendMessage(
      { to: 'recipient@example.com', subject: 'Test', body: 'Hello' },
      connectedAccount,
    );

    expect(result).toBeDefined();
    expect(result.headerMessageId).toBeDefined();
    expect(mockSmtpSendMail).toHaveBeenCalled();
  });

  it('should skip IMAP append when no sent folder is found', async () => {
    const messageFolderRepo = service['messageFolderRepository'];

    (messageFolderRepo.findOne as jest.Mock).mockResolvedValue(null);

    const result = await service.sendMessage(
      { to: 'recipient@example.com', subject: 'Test', body: 'Hello' },
      connectedAccount,
    );

    expect(result).toBeDefined();
    expect(mockImapAppend).not.toHaveBeenCalled();
  });
});
