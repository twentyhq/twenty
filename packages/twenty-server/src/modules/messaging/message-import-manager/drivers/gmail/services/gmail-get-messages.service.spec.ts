import { Test, type TestingModule } from '@nestjs/testing';

import { google } from 'googleapis';
import { ConnectedAccountProvider, MessageFolderImportPolicy } from 'twenty-shared/types';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { GmailGetMessagesService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-messages.service';
import { GmailMessagesImportErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-messages-import-error-handler.service';

jest.mock(
  'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-and-format-gmail-message.util',
  () => ({
    parseAndFormatGmailMessage: jest.fn((message) => ({
      externalId: message.id,
      messageThreadExternalId: message.threadId,
      messageFolderExternalIds: message.labelIds ?? [],
    })),
  }),
);

describe('GmailGetMessagesService', () => {
  let service: GmailGetMessagesService;
  let oAuth2ClientManagerService: OAuth2ClientManagerService;

  const mockConnectedAccount: Pick<
    ConnectedAccountEntity,
    | 'provider'
    | 'accessToken'
    | 'refreshToken'
    | 'id'
    | 'handle'
    | 'workspaceId'
    | 'handleAliases'
  > = {
    id: 'connected-account-id',
    provider: ConnectedAccountProvider.GOOGLE,
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    handle: 'test@gmail.com',
    workspaceId: 'workspace-id',
    handleAliases: ['alias@gmail.com'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GmailGetMessagesService,
        {
          provide: OAuth2ClientManagerService,
          useValue: {
            getGoogleOAuth2Client: jest.fn(),
          },
        },
        {
          provide: GmailMessagesImportErrorHandler,
          useValue: {
            handleError: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GmailGetMessagesService>(GmailGetMessagesService);
    oAuth2ClientManagerService = module.get<OAuth2ClientManagerService>(
      OAuth2ClientManagerService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should cap gmail message fetch concurrency', async () => {
    const messageIds = Array.from({ length: 30 }, (_, index) => `${index + 1}`);

    let activeCalls = 0;
    let maxConcurrentCalls = 0;

    const mockGmailClient = {
      users: {
        messages: {
          get: jest.fn().mockImplementation(async ({ id }) => {
            activeCalls += 1;
            maxConcurrentCalls = Math.max(maxConcurrentCalls, activeCalls);
            await new Promise((resolve) => setTimeout(resolve, 5));
            activeCalls -= 1;

            return {
              data: {
                id,
                threadId: `thread-${id}`,
                labelIds: ['INBOX'],
                payload: { headers: [] },
              },
            };
          }),
        },
      },
    };

    jest.spyOn(google, 'gmail').mockReturnValue(mockGmailClient as never);
    (
      oAuth2ClientManagerService.getGoogleOAuth2Client as jest.Mock
    ).mockResolvedValue({});

    await service.getMessages(messageIds, mockConnectedAccount, {
      messageFolders: [],
      messageFolderImportPolicy: MessageFolderImportPolicy.ALL_FOLDERS,
    });

    expect(mockGmailClient.users.messages.get).toHaveBeenCalledTimes(
      messageIds.length,
    );
    expect(maxConcurrentCalls).toBeLessThanOrEqual(10);
  });
});
