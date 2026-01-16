import { Test, type TestingModule } from '@nestjs/testing';

import { google } from 'googleapis';
import { ConnectedAccountProvider } from 'twenty-shared/types';

import { type MessageFolder } from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageFolderImportPolicy } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageFolderPendingSyncAction } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { GmailGetHistoryService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-history.service';
import { GmailGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-message-list.service';
import { GmailMessageListFetchErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-message-list-fetch-error-handler.service';

const createMockFolder = (
  overrides: Partial<MessageFolder> &
    Pick<MessageFolder, 'name' | 'externalId' | 'isSynced'>,
): MessageFolder => ({
  id: `folder-${overrides.externalId}`,
  syncCursor: null,
  isSentFolder: false,
  parentFolderId: null,
  pendingSyncAction: MessageFolderPendingSyncAction.NONE,
  ...overrides,
});

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
        messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
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
        messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
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
        messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
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
        messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
      });

      expect(result[0].messageExternalIds).toHaveLength(0);
      expect(mockGmailClient.users.messages.list).toHaveBeenCalledTimes(1);
    });
  });

  describe('folder exclusion filter (bug fix: Gmail ignoring Synced Folder config)', () => {
    it('should build exclusion query to skip disabled folders during initial sync', async () => {
      const mockGmailClient = {
        users: {
          messages: {
            list: jest.fn().mockResolvedValue({
              data: { messages: [{ id: 'msg-1' }], nextPageToken: undefined },
            }),
            get: jest.fn().mockResolvedValue({
              data: { historyId: '12345' },
            }),
          },
        },
      };

      jest.spyOn(google, 'gmail').mockReturnValue(mockGmailClient as never);
      (
        oAuth2ClientManagerService.getGoogleOAuth2Client as jest.Mock
      ).mockResolvedValue({});

      await service.getMessageLists({
        messageChannel: { syncCursor: '', id: 'channel-1' },
        connectedAccount: mockConnectedAccount,
        messageFolders: [
          createMockFolder({
            name: 'INBOX',
            externalId: 'INBOX',
            isSynced: true,
          }),
          createMockFolder({
            name: 'Promotions',
            externalId: 'CATEGORY_PROMOTIONS',
            isSynced: false,
          }),
          createMockFolder({
            name: 'Social',
            externalId: 'CATEGORY_SOCIAL',
            isSynced: false,
          }),
        ],
        messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
      });

      expect(mockGmailClient.users.messages.list).toHaveBeenCalledWith(
        expect.objectContaining({
          q: '-label:CATEGORY_PROMOTIONS -label:CATEGORY_SOCIAL',
        }),
      );
    });

    it('should skip exclusion filter when importing a newly-enabled folder', async () => {
      const mockGmailClient = {
        users: {
          messages: {
            list: jest.fn().mockResolvedValue({
              data: { messages: [{ id: 'msg-1' }], nextPageToken: undefined },
            }),
            get: jest.fn().mockResolvedValue({
              data: { historyId: '12345' },
            }),
          },
        },
      };

      jest.spyOn(google, 'gmail').mockReturnValue(mockGmailClient as never);
      (
        oAuth2ClientManagerService.getGoogleOAuth2Client as jest.Mock
      ).mockResolvedValue({});

      await service.getMessageLists({
        messageChannel: { syncCursor: '', id: 'channel-1' },
        connectedAccount: mockConnectedAccount,
        messageFolders: [
          createMockFolder({
            name: 'INBOX',
            externalId: 'INBOX',
            isSynced: true,
          }),
          createMockFolder({
            name: 'Promotions',
            externalId: 'CATEGORY_PROMOTIONS',
            isSynced: false,
          }),
        ],
        messageFolderImportPolicy: MessageFolderImportPolicy.ALL_FOLDERS,
      });

      expect(mockGmailClient.users.messages.list).toHaveBeenCalledWith(
        expect.objectContaining({ q: '' }),
      );
    });
  });

  describe('incremental sync folder filtering', () => {
    it('should exclude messages from disabled folders in history results', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          GmailGetMessageListService,
          {
            provide: OAuth2ClientManagerService,
            useValue: {
              getGoogleOAuth2Client: jest.fn().mockResolvedValue({}),
            },
          },
          {
            provide: GmailGetHistoryService,
            useValue: {
              getHistory: jest.fn(),
              getMessageIdsFromHistory: jest.fn().mockResolvedValue({
                messagesAdded: ['inbox-msg', 'promo-msg'],
                messagesDeleted: [],
              }),
            },
          },
          {
            provide: GmailMessageListFetchErrorHandler,
            useValue: { handleError: jest.fn() },
          },
        ],
      }).compile();

      const testService = module.get<GmailGetMessageListService>(
        GmailGetMessageListService,
      );
      const historyService = module.get<GmailGetHistoryService>(
        GmailGetHistoryService,
      );

      (historyService.getHistory as jest.Mock)
        .mockResolvedValueOnce({ history: [], historyId: 'new-cursor' })
        .mockResolvedValueOnce({
          history: [{ messagesAdded: [{ message: { id: 'promo-msg' } }] }],
        });

      jest.spyOn(google, 'gmail').mockReturnValue({} as never);

      const result = await testService.getMessageLists({
        messageChannel: { syncCursor: 'old-cursor', id: 'channel-1' },
        connectedAccount: mockConnectedAccount,
        messageFolders: [
          createMockFolder({
            name: 'INBOX',
            externalId: 'INBOX',
            isSynced: true,
          }),
          createMockFolder({
            name: 'Promotions',
            externalId: 'CATEGORY_PROMOTIONS',
            isSynced: false,
          }),
        ],
        messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
      });

      expect(result[0].messageExternalIds).toEqual(['inbox-msg']);
    });

    it('should return all messages when backfilling a newly-enabled folder', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          GmailGetMessageListService,
          {
            provide: OAuth2ClientManagerService,
            useValue: {
              getGoogleOAuth2Client: jest.fn().mockResolvedValue({}),
            },
          },
          {
            provide: GmailGetHistoryService,
            useValue: {
              getHistory: jest.fn().mockResolvedValue({
                history: [],
                historyId: 'new-cursor',
              }),
              getMessageIdsFromHistory: jest.fn().mockResolvedValue({
                messagesAdded: ['inbox-msg', 'promo-msg'],
                messagesDeleted: [],
              }),
            },
          },
          {
            provide: GmailMessageListFetchErrorHandler,
            useValue: { handleError: jest.fn() },
          },
        ],
      }).compile();

      const testService = module.get<GmailGetMessageListService>(
        GmailGetMessageListService,
      );

      jest.spyOn(google, 'gmail').mockReturnValue({} as never);

      const result = await testService.getMessageLists({
        messageChannel: { syncCursor: 'old-cursor', id: 'channel-1' },
        connectedAccount: mockConnectedAccount,
        messageFolders: [
          createMockFolder({
            name: 'INBOX',
            externalId: 'INBOX',
            isSynced: true,
          }),
          createMockFolder({
            name: 'Promotions',
            externalId: 'CATEGORY_PROMOTIONS',
            isSynced: false,
          }),
        ],
        messageFolderImportPolicy: MessageFolderImportPolicy.ALL_FOLDERS,
      });

      expect(result[0].messageExternalIds).toEqual(['inbox-msg', 'promo-msg']);
    });
  });
});
