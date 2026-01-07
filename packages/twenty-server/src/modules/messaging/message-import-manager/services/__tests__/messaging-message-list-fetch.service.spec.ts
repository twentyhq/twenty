import { Test, type TestingModule } from '@nestjs/testing';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessageFolderPendingSyncAction,
  type MessageFolderWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';
import { SyncMessageFoldersService } from 'src/modules/messaging/message-folder-manager/services/sync-message-folders.service';
import { MessagingAccountAuthenticationService } from 'src/modules/messaging/message-import-manager/services/messaging-account-authentication.service';
import { MessagingCursorService } from 'src/modules/messaging/message-import-manager/services/messaging-cursor.service';
import { MessagingGetMessageListService } from 'src/modules/messaging/message-import-manager/services/messaging-get-message-list.service';
import { MessageImportExceptionHandlerService } from 'src/modules/messaging/message-import-manager/services/messaging-import-exception-handler.service';
import { MessagingMessageListFetchService } from 'src/modules/messaging/message-import-manager/services/messaging-message-list-fetch.service';
import { MessagingMessagesImportService } from 'src/modules/messaging/message-import-manager/services/messaging-messages-import.service';
import { MessagingProcessFolderActionsService } from 'src/modules/messaging/message-import-manager/services/messaging-process-folder-actions.service';
import { MessagingProcessGroupEmailActionsService } from 'src/modules/messaging/message-import-manager/services/messaging-process-group-email-actions.service';

describe('MessagingMessageListFetchService', () => {
  let messagingMessageListFetchService: MessagingMessageListFetchService;
  let messagingGetMessageListService: MessagingGetMessageListService;
  let messagingAccountAuthenticationService: MessagingAccountAuthenticationService;
  let messageChannelSyncStatusService: MessageChannelSyncStatusService;
  let globalWorkspaceOrmManager: GlobalWorkspaceOrmManager;
  let messagingCursorService: MessagingCursorService;

  let mockMicrosoftMessageChannel: MessageChannelWorkspaceEntity;
  let mockGoogleMessageChannel: MessageChannelWorkspaceEntity;

  const workspaceId = 'workspace-id';

  beforeAll(() => {
    mockMicrosoftMessageChannel = {
      id: 'microsoft-message-channel-id',
      connectedAccount: {
        id: 'microsoft-connected-account-id',
        provider: ConnectedAccountProvider.MICROSOFT,
        handle: 'test@microsoft.com',
        accessToken: 'old-microsoft-access-token',
        refreshToken: 'microsoft-refresh-token',
        handleAliases: '',
      },
      messageFolders: [
        {
          id: 'inbox-folder-id',
          name: 'inbox',
          syncCursor: 'inbox-sync-cursor',
          messageChannelId: 'microsoft-message-channel-id',
        } as MessageFolderWorkspaceEntity,
      ],
    } as MessageChannelWorkspaceEntity;

    mockGoogleMessageChannel = {
      id: 'google-message-channel-id',
      connectedAccount: {
        id: 'google-connected-account-id',
        provider: ConnectedAccountProvider.GOOGLE,
        handle: 'test@gmail.com',
        accessToken: 'old-google-access-token',
        refreshToken: 'google-refresh-token',
        handleAliases: '',
      },
      syncCursor: 'google-sync-cursor',
      messageFolders: [],
    } as unknown as MessageChannelWorkspaceEntity;
  });

  beforeEach(async () => {
    const mockMessageChannelMessageAssociationRepository = {
      find: jest
        .fn()
        .mockResolvedValue([
          { messageExternalId: 'external-id-existing-message-1' },
          { messageExternalId: 'external-id-existing-message-2' },
        ]),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    const mockMessageFolderRepository = {
      find: jest.fn().mockImplementation(({ where }) => {
        if (where?.pendingSyncAction === 'FOLDER_DELETION') {
          return [];
        }

        return [
          {
            id: 'inbox-folder-id',
            name: 'inbox',
            syncCursor: 'inbox-sync-cursor',
            messageChannelId: 'microsoft-message-channel-id',
            isSynced: true,
          },
        ];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagingMessageListFetchService,
        {
          provide: CacheStorageNamespace.ModuleMessaging,
          useValue: {
            setAdd: jest.fn().mockResolvedValue(undefined),
            del: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: MessagingGetMessageListService,
          useValue: {
            getMessageLists: jest.fn().mockImplementation((messageChannel) => {
              if (
                messageChannel.connectedAccount.provider ===
                ConnectedAccountProvider.GOOGLE
              ) {
                return [
                  {
                    messageExternalIds: [
                      'external-id-existing-message-1',
                      'external-id-google-message-1',
                      'external-id-google-message-2',
                    ],
                    nextSyncCursor: 'new-google-history-id',
                    folderId: undefined,
                    messageExternalIdsToDelete: [],
                    previousSyncCursor: 'google-sync-cursor',
                  },
                ];
              } else {
                return [
                  {
                    messageExternalIds: [
                      'external-id-existing-message-1',
                      'external-id-new-message-1',
                      'external-id-new-message-2',
                    ],
                    nextSyncCursor: 'new-sync-cursor',
                    folderId: 'inbox-folder-id',
                    messageExternalIdsToDelete: [],
                    previousSyncCursor: 'inbox-sync-cursor',
                  },
                ];
              }
            }),
          },
        },
        {
          provide: MessagingMessagesImportService,
          useValue: {
            processMessageBatchImport: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: MessagingAccountAuthenticationService,
          useValue: {
            validateAndRefreshConnectedAccountAuthentication: jest
              .fn()
              .mockImplementation(({ connectedAccount }) => {
                if (
                  connectedAccount.provider === ConnectedAccountProvider.GOOGLE
                ) {
                  return {
                    accessToken: 'new-google-access-token',
                    refreshToken: 'new-google-refresh-token',
                  };
                }

                if (
                  connectedAccount.provider ===
                  ConnectedAccountProvider.MICROSOFT
                ) {
                  return {
                    accessToken: 'new-microsoft-access-token',
                    refreshToken: 'new-microsoft-refresh-token',
                  };
                }

                return {
                  accessToken: '',
                  refreshToken: '',
                };
              }),
          },
        },
        {
          provide: MessageChannelSyncStatusService,
          useValue: {
            markAsMessagesListFetchOngoing: jest
              .fn()
              .mockResolvedValue(undefined),
            markAsMessagesImportPending: jest.fn().mockResolvedValue(undefined),
            markAsMessagesImportScheduled: jest
              .fn()
              .mockResolvedValue(undefined),
          },
        },
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: {
            getGlobalWorkspaceDataSource: jest.fn().mockResolvedValue({
              manager: {},
            }),
            executeInWorkspaceContext: jest
              .fn()

              .mockImplementation((_authContext: any, fn: () => any) => fn()),
            getRepository: jest.fn().mockImplementation((workspaceId, name) => {
              if (name === 'messageChannel') {
                return {
                  findOne: jest.fn().mockResolvedValue(undefined),
                };
              }
              if (name === 'messageChannelMessageAssociation') {
                return mockMessageChannelMessageAssociationRepository;
              }
              if (name === 'messageFolder') {
                return mockMessageFolderRepository;
              }
            }),
          },
        },
        {
          provide: MessagingCursorService,
          useValue: {
            updateCursor: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: CacheStorageService,
          useValue: {
            setAdd: jest.fn().mockResolvedValue(undefined),
            del: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: MessageImportExceptionHandlerService,
          useValue: {
            handleDriverException: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: MessagingMessageCleanerService,
          useValue: {
            cleanWorkspaceThreads: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: SyncMessageFoldersService,
          useValue: {
            syncMessageFolders: jest.fn().mockResolvedValue([
              {
                id: 'inbox-folder-id',
                name: 'inbox',
                syncCursor: 'inbox-sync-cursor',
                messageChannelId: 'microsoft-message-channel-id',
                isSynced: true,
                pendingSyncAction: MessageFolderPendingSyncAction.NONE,
              },
            ]),
          },
        },
        {
          provide: MessagingProcessGroupEmailActionsService,
          useValue: {
            processGroupEmailActions: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: MessagingProcessFolderActionsService,
          useValue: {
            processFolderActions: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    messagingMessageListFetchService =
      module.get<MessagingMessageListFetchService>(
        MessagingMessageListFetchService,
      );
    messagingAccountAuthenticationService =
      module.get<MessagingAccountAuthenticationService>(
        MessagingAccountAuthenticationService,
      );

    messagingGetMessageListService = module.get<MessagingGetMessageListService>(
      MessagingGetMessageListService,
    );
    messageChannelSyncStatusService =
      module.get<MessageChannelSyncStatusService>(
        MessageChannelSyncStatusService,
      );
    globalWorkspaceOrmManager = module.get<GlobalWorkspaceOrmManager>(
      GlobalWorkspaceOrmManager,
    );
    messagingCursorService = module.get<MessagingCursorService>(
      MessagingCursorService,
    );
  });

  it('should process Microsoft message list fetch correctly', async () => {
    await messagingMessageListFetchService.processMessageListFetch(
      mockMicrosoftMessageChannel,
      workspaceId,
    );

    expect(
      messagingAccountAuthenticationService.validateAndRefreshConnectedAccountAuthentication,
    ).toHaveBeenCalledWith({
      connectedAccount: mockMicrosoftMessageChannel.connectedAccount,
      workspaceId,
      messageChannelId: mockMicrosoftMessageChannel.id,
    });
    expect(
      messageChannelSyncStatusService.markAsMessagesListFetchOngoing,
    ).toHaveBeenCalledWith([mockMicrosoftMessageChannel.id], workspaceId);

    expect(messagingGetMessageListService.getMessageLists).toHaveBeenCalledWith(
      {
        ...mockMicrosoftMessageChannel,
        connectedAccount: {
          ...mockMicrosoftMessageChannel.connectedAccount,
          accessToken: 'new-microsoft-access-token',
          refreshToken: 'new-microsoft-refresh-token',
        },
      },
      [
        {
          id: 'inbox-folder-id',
          name: 'inbox',
          syncCursor: 'inbox-sync-cursor',
          messageChannelId: 'microsoft-message-channel-id',
          isSynced: true,
          pendingSyncAction: MessageFolderPendingSyncAction.NONE,
        },
      ],
    );

    expect(globalWorkspaceOrmManager.getRepository).toHaveBeenCalledWith(
      workspaceId,
      'messageChannelMessageAssociation',
    );

    expect(messagingCursorService.updateCursor).toHaveBeenCalledWith(
      {
        ...mockMicrosoftMessageChannel,
        connectedAccount: {
          ...mockMicrosoftMessageChannel.connectedAccount,
          accessToken: 'new-microsoft-access-token',
          refreshToken: 'new-microsoft-refresh-token',
        },
      },
      'new-sync-cursor',
      workspaceId,
      'inbox-folder-id',
    );

    expect(
      messageChannelSyncStatusService.markAsMessagesImportScheduled,
    ).toHaveBeenCalledWith([mockMicrosoftMessageChannel.id], workspaceId);
  });

  it('should process Google message list fetch correctly', async () => {
    await messagingMessageListFetchService.processMessageListFetch(
      mockGoogleMessageChannel,
      workspaceId,
    );

    expect(
      messagingAccountAuthenticationService.validateAndRefreshConnectedAccountAuthentication,
    ).toHaveBeenCalledWith({
      connectedAccount: mockGoogleMessageChannel.connectedAccount,
      workspaceId,
      messageChannelId: mockGoogleMessageChannel.id,
    });
    expect(
      messageChannelSyncStatusService.markAsMessagesListFetchOngoing,
    ).toHaveBeenCalledWith([mockGoogleMessageChannel.id], workspaceId);

    expect(messagingGetMessageListService.getMessageLists).toHaveBeenCalledWith(
      {
        ...mockGoogleMessageChannel,
        connectedAccount: {
          ...mockGoogleMessageChannel.connectedAccount,
          accessToken: 'new-google-access-token',
          refreshToken: 'new-google-refresh-token',
        },
      },
      [
        {
          id: 'inbox-folder-id',
          name: 'inbox',
          syncCursor: 'inbox-sync-cursor',
          messageChannelId: 'microsoft-message-channel-id',
          isSynced: true,
          pendingSyncAction: MessageFolderPendingSyncAction.NONE,
        },
      ],
    );

    expect(globalWorkspaceOrmManager.getRepository).toHaveBeenCalledWith(
      workspaceId,
      'messageChannelMessageAssociation',
    );

    expect(messagingCursorService.updateCursor).toHaveBeenCalledWith(
      {
        ...mockGoogleMessageChannel,
        connectedAccount: {
          ...mockGoogleMessageChannel.connectedAccount,
          accessToken: 'new-google-access-token',
          refreshToken: 'new-google-refresh-token',
        },
      },
      'new-google-history-id',
      workspaceId,
      undefined,
    );

    expect(
      messageChannelSyncStatusService.markAsMessagesImportScheduled,
    ).toHaveBeenCalledWith([mockGoogleMessageChannel.id], workspaceId);
  });
});
