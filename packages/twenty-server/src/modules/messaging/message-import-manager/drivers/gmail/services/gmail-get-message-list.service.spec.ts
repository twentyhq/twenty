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
import { computeGmailExcludeSearchFilter } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-gmail-exclude-search-filter.util';

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
    refreshToken: 'refresh-token',
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
        messageChannel: {
          syncCursor: '',
          id: 'my-id',
          messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
        },
        connectedAccount: mockConnectedAccount,
        messageFolders: [
          createMockFolder({
            name: 'INBOX',
            externalId: 'INBOX',
            isSynced: true,
          }),
        ],
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
        messageChannel: {
          syncCursor: '',
          id: 'my-id',
          messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
        },
        connectedAccount: mockConnectedAccount,
        messageFolders: [
          createMockFolder({
            name: 'INBOX',
            externalId: 'INBOX',
            isSynced: true,
          }),
        ],
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
        messageChannel: {
          syncCursor: '',
          id: 'my-id',
          messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
        },
        connectedAccount: mockConnectedAccount,
        messageFolders: [
          createMockFolder({
            name: 'INBOX',
            externalId: 'INBOX',
            isSynced: true,
          }),
        ],
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
        messageChannel: {
          syncCursor: '',
          id: 'my-id',
          messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
        },
        connectedAccount: mockConnectedAccount,
        messageFolders: [
          createMockFolder({
            name: 'INBOX',
            externalId: 'INBOX',
            isSynced: true,
          }),
        ],
      });

      expect(result[0].messageExternalIds).toHaveLength(0);
      expect(mockGmailClient.users.messages.list).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no folders have isSynced=true with SELECTED_FOLDERS policy', async () => {
      const mockGmailClient = {
        users: {
          messages: {
            list: jest.fn(),
          },
        },
      };

      jest.spyOn(google, 'gmail').mockReturnValue(mockGmailClient as never);

      (
        oAuth2ClientManagerService.getGoogleOAuth2Client as jest.Mock
      ).mockResolvedValue({});

      const result = await service.getMessageLists({
        messageChannel: {
          syncCursor: '',
          id: 'my-id',
          messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
        },
        connectedAccount: mockConnectedAccount,
        messageFolders: [
          createMockFolder({
            name: 'Personal',
            externalId: 'Label_personal',
            isSynced: false,
          }),
          createMockFolder({
            name: 'Work',
            externalId: 'Label_work',
            isSynced: false,
          }),
        ],
      });

      expect(result).toEqual([]);
      expect(mockGmailClient.users.messages.list).not.toHaveBeenCalled();
    });
  });

  describe('initial sync folder filtering', () => {
    it('should build Gmail query with positive OR filter for synced folders', async () => {
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

      const messageFolders = [
        createMockFolder({
          name: 'INBOX',
          externalId: 'INBOX',
          isSynced: true,
        }),
        createMockFolder({
          name: 'Work',
          externalId: 'Label_work',
          isSynced: true,
        }),
        createMockFolder({
          name: 'Personal',
          externalId: 'Label_personal',
          isSynced: false,
        }),
        createMockFolder({
          name: 'Newsletters',
          externalId: 'Label_newsletters',
          isSynced: false,
        }),
      ];

      await service.getMessageLists({
        messageChannel: {
          syncCursor: '',
          id: 'channel-1',
          messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
        },
        connectedAccount: mockConnectedAccount,
        messageFolders,
      });

      const expectedQuery = computeGmailExcludeSearchFilter(
        messageFolders,
        MessageFolderImportPolicy.SELECTED_FOLDERS,
      );

      expect(mockGmailClient.users.messages.list).toHaveBeenCalledWith(
        expect.objectContaining({
          q: expectedQuery,
        }),
      );
    });

    it('should only include default exclusions when ALL_FOLDERS policy is set', async () => {
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
        messageChannel: {
          syncCursor: '',
          id: 'channel-1',
          messageFolderImportPolicy: MessageFolderImportPolicy.ALL_FOLDERS,
        },
        connectedAccount: mockConnectedAccount,
        messageFolders: [
          createMockFolder({
            name: 'INBOX',
            externalId: 'INBOX',
            isSynced: true,
          }),
          createMockFolder({
            name: 'Personal',
            externalId: 'Label_personal',
            isSynced: false,
          }),
        ],
      });

      const callArgs = mockGmailClient.users.messages.list.mock.calls[0][0];

      expect(callArgs.q).toContain('-label:spam');
      expect(callArgs.q).toContain('-category:promotions');
      expect(callArgs.q).not.toContain('label:inbox');
    });
  });

  describe('incremental sync folder filtering', () => {
    it('should filter out messages from disabled folders during incremental sync', async () => {
      const mockHistoryService = {
        getHistory: jest.fn(),
        getMessageIdsFromHistory: jest.fn(),
      };

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
            useValue: mockHistoryService,
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

      mockHistoryService.getHistory.mockImplementation(
        (_client, _cursor, _types, labelId) => {
          if (labelId === 'Label_personal') {
            return Promise.resolve({
              history: [
                { messagesAdded: [{ message: { id: 'personal-msg' } }] },
              ],
              historyId: 'new-cursor',
            });
          }
          if (labelId === undefined) {
            return Promise.resolve({
              history: [{ messagesAdded: [{ message: { id: 'inbox-msg' } }] }],
              historyId: 'new-cursor',
            });
          }

          return Promise.resolve({ history: [], historyId: 'new-cursor' });
        },
      );

      mockHistoryService.getMessageIdsFromHistory.mockResolvedValue({
        messagesAdded: ['inbox-msg', 'personal-msg'],
        messagesDeleted: [],
      });

      jest.spyOn(google, 'gmail').mockReturnValue({} as never);

      const result = await testService.getMessageLists({
        messageChannel: {
          syncCursor: 'old-cursor',
          id: 'channel-1',
          messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
        },
        connectedAccount: mockConnectedAccount,
        messageFolders: [
          createMockFolder({
            name: 'INBOX',
            externalId: 'INBOX',
            isSynced: true,
          }),
          createMockFolder({
            name: 'Personal',
            externalId: 'Label_personal',
            isSynced: false,
          }),
        ],
      });

      expect(result[0].messageExternalIds).toEqual(['inbox-msg']);

      const allHistoryCalls = mockHistoryService.getHistory.mock.calls;

      expect(allHistoryCalls[0]).toHaveLength(2);
      expect(allHistoryCalls[0][1]).toBe('old-cursor');

      const labelIdsQueried = allHistoryCalls
        .slice(1)
        .map((call) => call[3])
        .filter(Boolean);

      expect(labelIdsQueried).toContain('Label_personal');
      expect(labelIdsQueried).toHaveLength(1);

      // 1 main history call + 1 excluded folder call
      expect(mockHistoryService.getHistory).toHaveBeenCalledTimes(2);
    });

    it('should skip per-folder filtering when ALL_FOLDERS policy is set', async () => {
      const mockHistoryService = {
        getHistory: jest.fn(),
        getMessageIdsFromHistory: jest.fn(),
      };

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
            useValue: mockHistoryService,
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

      mockHistoryService.getHistory.mockResolvedValue({
        history: [],
        historyId: 'new-cursor',
      });

      mockHistoryService.getMessageIdsFromHistory.mockResolvedValue({
        messagesAdded: ['inbox-msg', 'personal-msg'],
        messagesDeleted: [],
      });

      jest.spyOn(google, 'gmail').mockReturnValue({} as never);

      const result = await testService.getMessageLists({
        messageChannel: {
          syncCursor: 'old-cursor',
          id: 'channel-1',
          messageFolderImportPolicy: MessageFolderImportPolicy.ALL_FOLDERS,
        },
        connectedAccount: mockConnectedAccount,
        messageFolders: [
          createMockFolder({
            name: 'INBOX',
            externalId: 'INBOX',
            isSynced: true,
          }),
          createMockFolder({
            name: 'Personal',
            externalId: 'Label_personal',
            isSynced: false,
          }),
        ],
      });

      expect(result[0].messageExternalIds).toEqual([
        'inbox-msg',
        'personal-msg',
      ]);
      expect(mockHistoryService.getHistory).toHaveBeenCalledTimes(1);
    });
  });
});
