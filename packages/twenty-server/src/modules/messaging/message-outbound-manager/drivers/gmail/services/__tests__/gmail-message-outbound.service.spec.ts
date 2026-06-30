import { Test, type TestingModule } from '@nestjs/testing';

import { google } from 'googleapis';
import { ConnectedAccountProvider } from 'twenty-shared/types';

import { GoogleOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client.provider';
import { GmailMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/drivers/gmail/services/gmail-message-outbound.service';

jest.mock('nodemailer/lib/mail-composer', () => {
  return jest.fn().mockImplementation(() => ({
    compile: jest.fn().mockReturnValue({
      build: jest.fn().mockResolvedValue(Buffer.from('mocked-email-content')),
    }),
  }));
});

describe('GmailMessageOutboundService', () => {
  let service: GmailMessageOutboundService;

  const mockSend = jest.fn().mockResolvedValue({ data: { id: 'message-id' } });
  const mockCreateDraft = jest
    .fn()
    .mockResolvedValue({ data: { id: 'draft-id' } });

  const mockGmailClient = {
    users: {
      messages: {
        send: mockSend,
      },
      drafts: {
        create: mockCreateDraft,
      },
      getProfile: jest
        .fn()
        .mockResolvedValue({ data: { emailAddress: 'test@example.com' } }),
    },
  };

  const mockPeopleClient = {
    people: {
      get: jest.fn().mockResolvedValue({
        data: {
          names: [
            {
              displayName: 'Test User',
            },
          ],
        },
      }),
    },
  };

  const mockOAuth2Client = {};

  beforeEach(async () => {
    jest.spyOn(google, 'gmail').mockReturnValue(mockGmailClient as never);
    jest.spyOn(google, 'people').mockReturnValue(mockPeopleClient as never);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GmailMessageOutboundService,
        {
          provide: GoogleOAuth2ClientProvider,
          useValue: {
            getClient: jest.fn().mockResolvedValue(mockOAuth2Client),
          },
        },
      ],
    }).compile();

    service = module.get<GmailMessageOutboundService>(
      GmailMessageOutboundService,
    );
  });

  afterEach(() => {
    mockSend.mockClear();
    mockCreateDraft.mockClear();
    jest.restoreAllMocks();
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
      id: 'connected-account-id',
      provider: ConnectedAccountProvider.GOOGLE,
    } as any;

    await service.sendMessage(sendMessageInput, connectedAccount);

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith({
      userId: 'me',
      requestBody: {
        raw: Buffer.from('mocked-email-content').toString('base64url'),
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
      id: 'connected-account-id',
      provider: ConnectedAccountProvider.GOOGLE,
    } as any;

    await service.sendMessage(sendMessageInput, connectedAccount);

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith({
      userId: 'me',
      requestBody: {
        raw: Buffer.from('mocked-email-content').toString('base64url'),
      },
    });
  });

  it('should create Gmail drafts in the existing thread when a thread id is provided', async () => {
    const sendMessageInput = {
      to: 'recipient@example.com',
      subject: 'Re: Existing thread',
      body: 'Plain text',
      html: '<p>HTML content</p>',
      attachments: [],
      inReplyTo: '<parent@example.com>',
      threadExternalId: 'gmail-thread-id',
    };

    const connectedAccount = {
      id: 'connected-account-id',
      provider: ConnectedAccountProvider.GOOGLE,
    } as any;

    await service.createDraft(sendMessageInput, connectedAccount);

    expect(mockCreateDraft).toHaveBeenCalledTimes(1);
    expect(mockCreateDraft).toHaveBeenCalledWith({
      userId: 'me',
      requestBody: {
        message: {
          raw: Buffer.from('mocked-email-content').toString('base64url'),
          threadId: 'gmail-thread-id',
        },
      },
    });
  });
});
