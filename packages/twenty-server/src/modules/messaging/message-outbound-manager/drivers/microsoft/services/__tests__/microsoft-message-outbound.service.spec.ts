import { Test, type TestingModule } from '@nestjs/testing';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { MicrosoftOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client.provider';
import { MicrosoftMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/drivers/microsoft/services/microsoft-message-outbound.service';

describe('MicrosoftMessageOutboundService', () => {
  let service: MicrosoftMessageOutboundService;

  const messagesRequest = {
    filter: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    top: jest.fn().mockReturnThis(),
    get: jest.fn(),
    post: jest.fn(),
  };

  const replyRequest = {
    post: jest.fn(),
  };

  const draftRequest = {
    patch: jest.fn(),
  };

  const mockMicrosoftClient = {
    api: jest.fn((path: string) => {
      switch (path) {
        case '/me/messages':
          return messagesRequest;
        case '/me/messages/parent-message-id/createReply':
          return replyRequest;
        case '/me/messages/reply-draft-id':
          return draftRequest;
        default:
          throw new Error(`Unexpected Microsoft Graph path: ${path}`);
      }
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    messagesRequest.filter.mockReturnThis();
    messagesRequest.select.mockReturnThis();
    messagesRequest.top.mockReturnThis();
    messagesRequest.get.mockResolvedValue({
      value: [{ id: 'parent-message-id' }],
    });
    replyRequest.post.mockResolvedValue({
      id: 'reply-draft-id',
      internetMessageId: '<reply@example.com>',
      conversationId: 'conversation-id',
    });
    draftRequest.patch.mockResolvedValue({
      id: 'reply-draft-id',
      internetMessageId: '<patched-reply@example.com>',
      conversationId: 'conversation-id',
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MicrosoftMessageOutboundService,
        {
          provide: MicrosoftOAuth2ClientProvider,
          useValue: {
            getClient: jest.fn().mockResolvedValue(mockMicrosoftClient),
          },
        },
      ],
    }).compile();

    service = module.get<MicrosoftMessageOutboundService>(
      MicrosoftMessageOutboundService,
    );
  });

  it('creates Microsoft drafts as replies when a parent internet message id is provided', async () => {
    const connectedAccount = {
      id: 'connected-account-id',
      provider: ConnectedAccountProvider.MICROSOFT,
    } as any;

    await service.createDraft(
      {
        to: 'recipient@example.com',
        subject: 'Re: Existing thread',
        body: 'Plain text',
        html: '<p>HTML content</p>',
        attachments: [],
        inReplyTo: "<parent's-message@example.com>",
      },
      connectedAccount,
    );

    expect(mockMicrosoftClient.api).toHaveBeenCalledWith('/me/messages');
    expect(messagesRequest.filter).toHaveBeenCalledWith(
      "internetMessageId eq '<parent''s-message@example.com>'",
    );
    expect(messagesRequest.select).toHaveBeenCalledWith('id');
    expect(messagesRequest.top).toHaveBeenCalledWith(1);

    expect(mockMicrosoftClient.api).toHaveBeenCalledWith(
      '/me/messages/parent-message-id/createReply',
    );
    expect(replyRequest.post).toHaveBeenCalledWith({});

    expect(mockMicrosoftClient.api).toHaveBeenCalledWith(
      '/me/messages/reply-draft-id',
    );
    expect(draftRequest.patch).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Re: Existing thread',
        body: {
          contentType: 'HTML',
          content: '<p>HTML content</p>',
        },
      }),
    );
    expect(messagesRequest.post).not.toHaveBeenCalled();
  });
});
