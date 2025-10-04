import { Test, type TestingModule } from '@nestjs/testing';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { GmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/gmail-client.provider';
import { OAuth2ClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/oauth2-client.provider';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { MicrosoftClientProvider } from 'src/modules/messaging/message-import-manager/drivers/microsoft/providers/microsoft-client.provider';
import { SmtpClientProvider } from 'src/modules/messaging/message-import-manager/drivers/smtp/providers/smtp-client.provider';
import { MessagingSendMessageService } from 'src/modules/messaging/message-import-manager/services/messaging-send-message.service';

describe('MessagingSendMessageService - Gmail HTML Support', () => {
  let service: MessagingSendMessageService;
  let gmailClientProvider: jest.Mocked<GmailClientProvider>;
  let oAuth2ClientProvider: jest.Mocked<OAuth2ClientProvider>;

  beforeEach(async () => {
    const mockGmailClient = {
      users: {
        messages: {
          send: jest.fn().mockResolvedValue({ data: { id: 'message-id' } }),
        },
      },
    };

    const mockOAuth2Client = {
      userinfo: {
        get: jest.fn().mockResolvedValue({
          data: { email: 'test@example.com', name: 'Test User' },
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagingSendMessageService,
        {
          provide: GmailClientProvider,
          useValue: {
            getGmailClient: jest.fn().mockResolvedValue(mockGmailClient),
          },
        },
        {
          provide: OAuth2ClientProvider,
          useValue: {
            getOAuth2Client: jest.fn().mockResolvedValue(mockOAuth2Client),
          },
        },
        {
          provide: MicrosoftClientProvider,
          useValue: {},
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
    gmailClientProvider = module.get(GmailClientProvider);
    oAuth2ClientProvider = module.get(OAuth2ClientProvider);
  });

  it('should send multipart/alternative email with both text and HTML parts via Gmail', async () => {
    const sendMessageInput = {
      to: 'recipient@example.com',
      subject: 'Test HTML Email',
      body: 'This is plain text content',
      html: '<p>This is <strong>HTML</strong> content</p>',
    };

    const connectedAccount = {
      provider: ConnectedAccountProvider.GOOGLE,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    } as any;

    await service.sendMessage(sendMessageInput, connectedAccount);

    const gmailClient =
      await gmailClientProvider.getGmailClient(connectedAccount);
    const sendCall = gmailClient.users.messages.send as jest.Mock;

    expect(sendCall).toHaveBeenCalledTimes(1);

    const sentMessage = sendCall.mock.calls[0][0];
    const rawMessage = Buffer.from(
      sentMessage.requestBody.raw,
      'base64',
    ).toString();

    expect(rawMessage).toContain('MIME-Version: 1.0');
    expect(rawMessage).toContain(
      'Content-Type: multipart/alternative; boundary=',
    );
    expect(rawMessage).toContain('Content-Type: text/plain; charset="UTF-8"');
    expect(rawMessage).toContain('Content-Type: text/html; charset="UTF-8"');
    expect(rawMessage).toContain('This is plain text content');
    expect(rawMessage).toContain(
      '<p>This is <strong>HTML</strong> content</p>',
    );
    expect(rawMessage).toContain('To: recipient@example.com');
    expect(rawMessage).toContain('Subject:');
  });

  it('should handle missing fromName gracefully', async () => {
    const mockOAuth2ClientNoName = {
      userinfo: {
        get: jest.fn().mockResolvedValue({
          data: { email: 'test@example.com' }, // No name field
        }),
      },
    };

    (oAuth2ClientProvider.getOAuth2Client as jest.Mock).mockResolvedValueOnce(
      mockOAuth2ClientNoName,
    );

    const sendMessageInput = {
      to: 'recipient@example.com',
      subject: 'Test Email',
      body: 'Plain text',
      html: '<p>HTML content</p>',
    };

    const connectedAccount = {
      provider: ConnectedAccountProvider.GOOGLE,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    } as any;

    await service.sendMessage(sendMessageInput, connectedAccount);

    const gmailClient =
      await gmailClientProvider.getGmailClient(connectedAccount);
    const sendCall = gmailClient.users.messages.send as jest.Mock;
    const rawMessage = Buffer.from(
      sendCall.mock.calls[0][0].requestBody.raw,
      'base64',
    ).toString();

    expect(rawMessage).toContain('From: test@example.com');
    expect(rawMessage).not.toContain('""');
  });
});
