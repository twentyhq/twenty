import { Test, TestingModule } from '@nestjs/testing';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';
import { MessagingCursorService } from 'src/modules/messaging/message-import-manager/services/messaging-cursor.service';
import { MessagingGetMessageListService } from 'src/modules/messaging/message-import-manager/services/messaging-get-message-list.service';
import { MessageImportExceptionHandlerService } from 'src/modules/messaging/message-import-manager/services/messaging-import-exception-handler.service';
import { MessagingMessageListFetchService } from 'src/modules/messaging/message-import-manager/services/messaging-message-list-fetch.service';

describe('MessagingMessageListFetchService', () => {
  let messagingMessageListFetchService: MessagingMessageListFetchService;
  let messagingGetMessageListService: MessagingGetMessageListService;
  let messageChannelSyncStatusService: MessageChannelSyncStatusService;
  let twentyORMManager: TwentyORMManager;
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
        refreshToken: 'refresh-token',
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
        refreshToken: 'google-refresh-token',
        handleAliases: '',
      },
      syncCursor: 'google-sync-cursor',
    } as MessageChannelWorkspaceEntity;
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagingMessageListFetchService,
        {
          provide: CacheStorageNamespace.ModuleMessaging,
          useValue: {
            setAdd: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: MessagingGetMessageListService,
          useValue: {
            getMessageLists: jest
              .fn()
              .mockImplementation(({ connectedAccount }) => {
                if (
                  connectedAccount.provider === ConnectedAccountProvider.GOOGLE
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
          provide: MessageChannelSyncStatusService,
          useValue: {
            markAsMessagesListFetchOngoing: jest
              .fn()
              .mockResolvedValue(undefined),
            scheduleMessagesImport: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: TwentyORMManager,
          useValue: {
            getRepository: jest
              .fn()
              .mockResolvedValue(
                mockMessageChannelMessageAssociationRepository,
              ),
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
      ],
    }).compile();

    messagingMessageListFetchService =
      module.get<MessagingMessageListFetchService>(
        MessagingMessageListFetchService,
      );
    messagingGetMessageListService = module.get<MessagingGetMessageListService>(
      MessagingGetMessageListService,
    );
    messageChannelSyncStatusService =
      module.get<MessageChannelSyncStatusService>(
        MessageChannelSyncStatusService,
      );
    twentyORMManager = module.get<TwentyORMManager>(TwentyORMManager);
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
      messageChannelSyncStatusService.markAsMessagesListFetchOngoing,
    ).toHaveBeenCalledWith([mockMicrosoftMessageChannel.id]);

    expect(messagingGetMessageListService.getMessageLists).toHaveBeenCalledWith(
      mockMicrosoftMessageChannel,
    );

    expect(twentyORMManager.getRepository).toHaveBeenCalledWith(
      'messageChannelMessageAssociation',
    );

    expect(messagingCursorService.updateCursor).toHaveBeenCalledWith(
      mockMicrosoftMessageChannel,
      'new-sync-cursor',
      'inbox-folder-id',
    );

    expect(
      messageChannelSyncStatusService.scheduleMessagesImport,
    ).toHaveBeenCalledWith([mockMicrosoftMessageChannel.id]);
  });

  it('should process Google message list fetch correctly', async () => {
    await messagingMessageListFetchService.processMessageListFetch(
      mockGoogleMessageChannel,
      workspaceId,
    );

    expect(
      messageChannelSyncStatusService.markAsMessagesListFetchOngoing,
    ).toHaveBeenCalledWith([mockGoogleMessageChannel.id]);

    expect(messagingGetMessageListService.getMessageLists).toHaveBeenCalledWith(
      mockGoogleMessageChannel,
    );

    expect(twentyORMManager.getRepository).toHaveBeenCalledWith(
      'messageChannelMessageAssociation',
    );

    expect(messagingCursorService.updateCursor).toHaveBeenCalledWith(
      mockGoogleMessageChannel,
      'new-google-history-id',
      undefined,
    );

    expect(
      messageChannelSyncStatusService.scheduleMessagesImport,
    ).toHaveBeenCalledWith([mockGoogleMessageChannel.id]);
  });
});
