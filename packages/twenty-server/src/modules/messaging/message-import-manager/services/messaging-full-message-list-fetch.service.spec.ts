import { Test, TestingModule } from '@nestjs/testing';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { MessagingCursorService } from 'src/modules/messaging/message-import-manager/services/messaging-cursor.service';
import { MessagingFullMessageListFetchService } from 'src/modules/messaging/message-import-manager/services/messaging-full-message-list-fetch.service';
import { MessagingGetMessageListService } from 'src/modules/messaging/message-import-manager/services/messaging-get-message-list.service';
import { MessageImportExceptionHandlerService } from 'src/modules/messaging/message-import-manager/services/messaging-import-exception-handler.service';

describe('MessagingFullMessageListFetchService', () => {
  let messagingFullMessageListFetchService: MessagingFullMessageListFetchService;
  let messagingGetMessageListService: MessagingGetMessageListService;
  let messageChannelSyncStatusService: MessageChannelSyncStatusService;
  let twentyORMManager: TwentyORMManager;
  let messagingCursorService: MessagingCursorService;

  let mockMicrosoftMessageChannel: MessageChannelWorkspaceEntity;
  let mockConnectedAccount: ConnectedAccountWorkspaceEntity;
  const workspaceId = 'workspace-id';

  beforeAll(() => {
    // Create mock Microsoft message channel
    mockConnectedAccount = {
      id: 'microsoft-connected-account-id',
      provider: ConnectedAccountProvider.MICROSOFT,
      handle: 'test@microsoft.com',
      refreshToken: 'refresh-token',
      handleAliases: '',
    } as ConnectedAccountWorkspaceEntity;

    mockMicrosoftMessageChannel = {
      id: 'microsoft-message-channel-id',
      connectedAccount: mockConnectedAccount,
      messageFolders: [
        {
          id: 'inbox-folder-id',
          name: 'inbox',
          syncCursor: 'inbox-sync-cursor',
          messageChannelId: 'microsoft-message-channel-id',
        } as MessageFolderWorkspaceEntity,
      ],
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
        MessagingFullMessageListFetchService,
        {
          provide: CacheStorageNamespace.ModuleMessaging,
          useValue: {
            setAdd: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: MessagingGetMessageListService,
          useValue: {
            getFullMessageLists: jest.fn().mockResolvedValue([
              {
                messageExternalIds: [
                  'external-id-existing-message-1',
                  'external-id-new-message-1',
                  'external-id-new-message-2',
                ],
                nextSyncCursor: 'new-sync-cursor',
                folderId: 'inbox-folder-id',
              },
            ]),
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
      ],
    }).compile();

    messagingFullMessageListFetchService =
      module.get<MessagingFullMessageListFetchService>(
        MessagingFullMessageListFetchService,
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
    await messagingFullMessageListFetchService.processMessageListFetch(
      mockMicrosoftMessageChannel,
      workspaceId,
    );

    expect(
      messageChannelSyncStatusService.markAsMessagesListFetchOngoing,
    ).toHaveBeenCalledWith([mockMicrosoftMessageChannel.id]);

    // Verify getFullMessageLists is called with the Microsoft message channel
    expect(
      messagingGetMessageListService.getFullMessageLists,
    ).toHaveBeenCalledWith(mockMicrosoftMessageChannel);

    // Verify getRepository is called for messageChannelMessageAssociation
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
});
