import { type Repository } from 'typeorm';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { type MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { type ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { type ImapFindDraftsFolderService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-find-drafts-folder.service';
import { type SmtpClientProvider } from 'src/modules/messaging/message-import-manager/drivers/smtp/providers/smtp-client.provider';
import { ImapSmtpMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/drivers/imap/services/imap-smtp-message-outbound.service';
import { type SendMessageInput } from 'src/modules/messaging/message-outbound-manager/types/send-message-input.type';

describe('ImapSmtpMessageOutboundService', () => {
  let service: ImapSmtpMessageOutboundService;
  let mockSmtpClientProvider: jest.Mocked<Partial<SmtpClientProvider>>;
  let mockImapClientProvider: jest.Mocked<Partial<ImapClientProvider>>;
  let mockImapFindDraftsFolderService: jest.Mocked<
    Partial<ImapFindDraftsFolderService>
  >;
  let mockMessageChannelRepository: jest.Mocked<
    Partial<Repository<MessageChannelEntity>>
  >;
  let mockMessageFolderRepository: jest.Mocked<
    Partial<Repository<MessageFolderEntity>>
  >;
  let mockImapClient: {
    append: jest.Mock;
  };

  beforeEach(() => {
    jest.useRealTimers();

    mockImapClient = {
      append: jest.fn().mockResolvedValue({ path: 'Drafts', uid: 1 }),
    };

    mockSmtpClientProvider = {
      getClient: jest.fn(),
    };

    mockImapClientProvider = {
      getClient: jest.fn().mockResolvedValue(mockImapClient as never),
      closeClient: jest.fn().mockResolvedValue(undefined),
    };

    mockImapFindDraftsFolderService = {
      findOrCreateDraftsFolder: jest
        .fn()
        .mockResolvedValue({ path: 'Drafts' } as never),
    };

    mockMessageChannelRepository = {
      findOne: jest.fn(),
    };

    mockMessageFolderRepository = {
      findOne: jest.fn(),
    };

    service = new ImapSmtpMessageOutboundService(
      mockSmtpClientProvider as SmtpClientProvider,
      mockImapClientProvider as ImapClientProvider,
      mockImapFindDraftsFolderService as ImapFindDraftsFolderService,
      mockMessageChannelRepository as Repository<MessageChannelEntity>,
      mockMessageFolderRepository as Repository<MessageFolderEntity>,
    );
  });

  const connectedAccount = {
    id: 'account-1',
    handle: 'user@example.com',
    connectionParameters: {
      name: 'User Name',
      IMAP: {},
      SMTP: {},
    },
  } as unknown as ConnectedAccountEntity;

  const sendMessageInput: SendMessageInput = {
    to: ['recipient@example.com'],
    subject: 'Multi-paragraph email',
    body: 'Paragraph 1\n\nParagraph 2',
    html: '<p>Paragraph 1</p>\n<p>Paragraph 2</p>',
  };

  it('should compile draft message buffer with strictly CRLF line endings', async () => {
    await service.createDraft(sendMessageInput, connectedAccount);

    expect(mockImapClient.append).toHaveBeenCalledTimes(1);
    const [path, buffer, flags] = mockImapClient.append.mock.calls[0];

    expect(path).toBe('Drafts');
    expect(flags).toEqual(['\\Draft']);

    const bufferStr = buffer.toString('utf8');
    // Ensure no bare LF exists in the compiled message buffer
    expect(/[^\r]\n/.test(bufferStr)).toBe(false);
    expect(bufferStr).toContain('\r\n');
  });

  it('should surface responseText and preserve cause in error when imap append fails with server rejection', async () => {
    const imapError = new Error('Command failed') as Error & {
      responseText?: string;
    };
    imapError.responseText = 'Message contains bare newlines';

    mockImapClient.append.mockRejectedValueOnce(imapError);

    let thrownError: Error | undefined;
    try {
      await service.createDraft(sendMessageInput, connectedAccount);
    } catch (err) {
      thrownError = err as Error;
    }

    expect(thrownError).toBeDefined();
    expect(thrownError?.message).toBe(
      'Failed to create draft: Message contains bare newlines',
    );
    expect((thrownError as Error & { cause?: unknown })?.cause).toBe(imapError);

    expect(mockImapClientProvider.closeClient).toHaveBeenCalledWith(
      mockImapClient,
    );
  });

  it('should rethrow standard error when responseText is not available', async () => {
    const genericError = new Error('Network timeout');

    mockImapClient.append.mockRejectedValueOnce(genericError);

    await expect(
      service.createDraft(sendMessageInput, connectedAccount),
    ).rejects.toThrow('Network timeout');

    expect(mockImapClientProvider.closeClient).toHaveBeenCalledWith(
      mockImapClient,
    );
  });
});
