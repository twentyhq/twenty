import { Test, type TestingModule } from '@nestjs/testing';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { SmtpClientProvider } from 'src/modules/messaging/message-import-manager/drivers/smtp/providers/smtp-client.provider';
import { MessagingSendMessageService } from 'src/modules/messaging/message-import-manager/services/messaging-send-message.service';

jest.mock('nodemailer/lib/mail-composer', () => {
  return jest.fn().mockImplementation(() => ({
    compile: jest.fn().mockReturnValue({
      build: jest.fn().mockResolvedValue(Buffer.from('mocked-email-content')),
    }),
  }));
});

describe('MessagingSendMessageService - Gmail HTML Support', () => {
  let service: MessagingSendMessageService;
  let oAuth2ClientManagerService: OAuth2ClientManagerService;

  const mockGmailClient = {
    users: {
      messages: {
        send: jest.fn().mockResolvedValue({ data: { id: 'message-id' } }),
      },
    },
  };

  const mockOAuth2Client = {
    gmail: jest.fn().mockReturnValue(mockGmailClient),
    userinfo: {
      get: jest.fn().mockResolvedValue({
        data: { email: 'test@example.com', name: 'Test User' },
      }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagingSendMessageService,
        {
          provide: OAuth2ClientManagerService,
          useValue: {
            getGoogleOAuth2Client: jest
              .fn()
              .mockResolvedValue(mockOAuth2Client),
          },
        },
        {
          provide: SmtpClientProvider,
          useValue: {},
        },
        {
          provide: ImapClientProvider,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<MessagingSendMessageService>(
      MessagingSendMessageService,
    );
    oAuth2ClientManagerService = module.get<OAuth2ClientManagerService>(
      OAuth2ClientManagerService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send multipart/alternative email with both text and HTML parts via Gmail', async () => {
    const sendMessageInput = {
      to: 'recipient@example.com',
      subject: 'Test HTML Email',
      body: 'This is plain text content',
      html: '<p>This is <strong>HTML</strong> content</p>',
      attachments: [],
    };

    const connectedAccount = {
      provider: ConnectedAccountProvider.GOOGLE,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    } as any;

    await service.sendMessage(sendMessageInput, connectedAccount);

    const mockOAuth2Client =
      await oAuth2ClientManagerService.getGoogleOAuth2Client(connectedAccount);

    const gmailClient = mockOAuth2Client.gmail({ version: 'v1' });

    const sendCall = gmailClient.users.messages.send as jest.Mock;

    expect(sendCall).toHaveBeenCalledTimes(1);
    expect(sendCall).toHaveBeenCalledWith({
      userId: 'me',
      requestBody: {
        raw: Buffer.from('mocked-email-content').toString('base64'),
      },
    });
  });

  it('should handle missing fromName gracefully', async () => {
    const mockGmailClient = {
      users: {
        messages: {
          send: jest.fn().mockResolvedValue({ data: { id: 'message-id' } }),
        },
      },
    };

    const mockOAuth2ClientNoName = {
      gmail: jest.fn().mockReturnValue(mockGmailClient),
      userinfo: {
        get: jest.fn().mockResolvedValue({
          data: { email: 'test@example.com' }, // No name field
        }),
      },
    };

    (
      oAuth2ClientManagerService.getGoogleOAuth2Client as jest.Mock
    ).mockResolvedValueOnce(mockOAuth2ClientNoName);

    const sendMessageInput = {
      to: 'recipient@example.com',
      subject: 'Test Email',
      body: 'Plain text',
      html: '<p>HTML content</p>',
      attachments: [],
    };

    const connectedAccount = {
      provider: ConnectedAccountProvider.GOOGLE,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    } as any;

    await service.sendMessage(sendMessageInput, connectedAccount);

    const sendCall = mockGmailClient.users.messages.send as jest.Mock;

    expect(sendCall).toHaveBeenCalledTimes(1);

    expect(sendCall).toHaveBeenCalledWith({
      userId: 'me',
      requestBody: {
        raw: Buffer.from('mocked-email-content').toString('base64'),
      },
    });
  });

  it('should send email with attachments via Gmail', async () => {
    const sendMessageInput = {
      to: 'recipient@example.com',
      subject: 'Test Email with Attachments',
      body: 'Plain text',
      html: '<p>HTML content</p>',
      attachments: [
        {
          filename: 'test.pdf',
          content: Buffer.from('test-pdf-content'),
          contentType: 'application/pdf',
        },
      ],
    };

    const connectedAccount = {
      provider: ConnectedAccountProvider.GOOGLE,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    } as any;

    await service.sendMessage(sendMessageInput, connectedAccount);

    const mockOAuth2Client =
      await oAuth2ClientManagerService.getGoogleOAuth2Client(connectedAccount);

    const gmailClient = mockOAuth2Client.gmail({ version: 'v1' });

    const sendCall = gmailClient.users.messages.send as jest.Mock;

    expect(sendCall).toHaveBeenCalledTimes(1);
    expect(sendCall).toHaveBeenCalledWith({
      userId: 'me',
      requestBody: {
        raw: Buffer.from('mocked-email-content').toString('base64'),
      },
    });
  });
});
