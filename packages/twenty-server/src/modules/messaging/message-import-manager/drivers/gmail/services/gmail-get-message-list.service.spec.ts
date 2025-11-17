import { Test, type TestingModule } from '@nestjs/testing';

import { google } from 'googleapis';
import { ConnectedAccountProvider } from 'twenty-shared/types';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { GmailGetHistoryService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-history.service';
import { GmailGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-message-list.service';
import { GmailMessageListFetchErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-message-list-fetch-error-handler.service';

describe('GmailGetMessageListService', () => {
  let service: GmailGetMessageListService;
  let oAuth2ClientManagerService: OAuth2ClientManagerService;

  const mockConnectedAccount: Pick<
    ConnectedAccountWorkspaceEntity,
    | 'provider'
    | 'accessToken'
    | 'refreshToken'
    | 'id'
    | 'handle'
    | 'connectionParameters'
  > = {
    id: 'connected-account-id',
    provider: ConnectedAccountProvider.GOOGLE,
    accessToken: 'access-token',
    refreshToken: 'refresh-token', // dummy value for testing
    handle: 'test@gmail.com',
    connectionParameters: {},
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GmailGetMessageListService,
        {
          provide: OAuth2ClientManagerService,
          useValue: {
            getGoogleOAuth2Client: jest.fn(),
          },
        },
        {
          provide: GmailGetHistoryService,
          useValue: {
            getHistory: jest.fn(),
            getMessageIdsFromHistory: jest.fn(),
          },
        },
        {
          provide: GmailMessageListFetchErrorHandler,
          useValue: {
            handleError: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GmailGetMessageListService>(
      GmailGetMessageListService,
    );
    oAuth2ClientManagerService = module.get<OAuth2ClientManagerService>(
      OAuth2ClientManagerService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getMessageList', () => {
    it('should return 0 messageExternalIds when gmail returns 0 messages', async () => {
      const mockGmailClient = {
        users: {
          messages: {
            list: jest.fn().mockResolvedValue({
              data: {
                messages: [],
                nextPageToken: undefined,
              },
            }),
          },
        },
      };

      jest.spyOn(google, 'gmail').mockReturnValue(mockGmailClient as never);

      (
        oAuth2ClientManagerService.getGoogleOAuth2Client as jest.Mock
      ).mockResolvedValue({});

      const result = await service.getMessageLists({
        messageChannel: { syncCursor: '', id: 'my-id' },
        connectedAccount: mockConnectedAccount,
        messageFolders: [],
      });

      expect(result[0].messageExternalIds).toHaveLength(0);
      expect(mockGmailClient.users.messages.list).toHaveBeenCalledTimes(1);
    });

    it('should return 5 messageExternalIds when gmail returns 5 messages', async () => {
      const mockMessages = [
        {
          id: `message-1`,
        },
        {
          id: `message-2`,
        },
        {
          id: `message-3`,
        },
        {
          id: `message-4`,
        },
        {
          id: `message-5`,
        },
      ];

      const mockGmailClient = {
        users: {
          messages: {
            list: jest.fn().mockResolvedValue({
              data: {
                messages: mockMessages,
                nextPageToken: undefined,
              },
            }),
            get: jest.fn().mockResolvedValue({
              data: {
                historyId: 'history-id-123',
              },
            }),
          },
        },
      };

      jest.spyOn(google, 'gmail').mockReturnValue(mockGmailClient as never);

      (
        oAuth2ClientManagerService.getGoogleOAuth2Client as jest.Mock
      ).mockResolvedValue({});

      const result = await service.getMessageLists({
        messageChannel: { syncCursor: '', id: 'my-id' },
        connectedAccount: mockConnectedAccount,
        messageFolders: [],
      });

      expect(result[0].messageExternalIds).toHaveLength(5);
    });

    it('should return 3 messageExternalIds when gmail provides a nextpagetoken with 2 messages, then 1', async () => {
      const mockGmailClient = {
        users: {
          messages: {
            list: jest
              .fn()
              .mockResolvedValueOnce({
                data: {
                  messages: [
                    {
                      id: `message-1`,
                    },
                    {
                      id: `message-2`,
                    },
                  ],
                  nextPageToken: 'next-page-token',
                },
              })
              .mockResolvedValueOnce({
                data: {
                  messages: [
                    {
                      id: `message-3`,
                    },
                  ],
                  nextPageToken: undefined,
                },
              }),
            get: jest.fn().mockResolvedValue({
              data: {
                historyId: 'history-id-123',
              },
            }),
          },
        },
      };

      jest.spyOn(google, 'gmail').mockReturnValue(mockGmailClient as never);

      (
        oAuth2ClientManagerService.getGoogleOAuth2Client as jest.Mock
      ).mockResolvedValue({});

      const result = await service.getMessageLists({
        messageChannel: { syncCursor: '', id: 'my-id' },
        connectedAccount: mockConnectedAccount,
        messageFolders: [],
      });

      expect(result[0].messageExternalIds).toHaveLength(3);
      expect(mockGmailClient.users.messages.list).toHaveBeenCalledTimes(2);
    });
    it('should go through while loop once when gmail provides a nextpagetoken but 0 messages - should never happen IRL', async () => {
      const mockGmailClient = {
        users: {
          messages: {
            list: jest.fn().mockResolvedValue({
              data: {
                messages: [],
                nextPageToken: 'next-page-token',
              },
            }),
          },
          get: jest.fn().mockResolvedValue({
            data: {
              historyId: 'history-id-123',
            },
          }),
        },
      };

      jest.spyOn(google, 'gmail').mockReturnValue(mockGmailClient as never);

      (
        oAuth2ClientManagerService.getGoogleOAuth2Client as jest.Mock
      ).mockResolvedValue({});

      const result = await service.getMessageLists({
        messageChannel: { syncCursor: '', id: 'my-id' },
        connectedAccount: mockConnectedAccount,
        messageFolders: [],
      });

      expect(result[0].messageExternalIds).toHaveLength(0);
      expect(mockGmailClient.users.messages.list).toHaveBeenCalledTimes(1);
    });
  });
});
