import { Test, TestingModule } from '@nestjs/testing';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { GmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/gmail-client.provider';
import { GmailGetHistoryService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-history.service';
import { GmailGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-message-list.service';
import { GmailHandleErrorService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-handle-error.service';

describe('GmailGetMessageListService', () => {
  let service: GmailGetMessageListService;
  let gmailClientProvider: GmailClientProvider;

  const mockConnectedAccount: Pick<
    ConnectedAccountWorkspaceEntity,
    'provider' | 'refreshToken' | 'id' | 'handle' | 'connectionParameters'
  > = {
    id: 'connected-account-id',
    provider: ConnectedAccountProvider.GOOGLE,
    refreshToken: 'refresh-token',
    handle: 'test@gmail.com',
    connectionParameters: {},
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GmailGetMessageListService,
        {
          provide: GmailClientProvider,
          useValue: {
            getGmailClient: jest.fn(),
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
          provide: GmailHandleErrorService,
          useValue: {
            handleGmailMessageListFetchError: jest.fn(),
            handleGmailMessagesImportError: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GmailGetMessageListService>(
      GmailGetMessageListService,
    );
    gmailClientProvider = module.get<GmailClientProvider>(GmailClientProvider);
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

      (gmailClientProvider.getGmailClient as jest.Mock).mockResolvedValue(
        mockGmailClient,
      );

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

      (gmailClientProvider.getGmailClient as jest.Mock).mockResolvedValue(
        mockGmailClient,
      );

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

      (gmailClientProvider.getGmailClient as jest.Mock).mockResolvedValue(
        mockGmailClient,
      );

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

      (gmailClientProvider.getGmailClient as jest.Mock).mockResolvedValue(
        mockGmailClient,
      );

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
