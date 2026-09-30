import { type Repository } from 'typeorm';

import {
  MessageChannelPendingGroupEmailsAction,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageFolderPendingSyncAction,
} from 'twenty-shared/types';

import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { type SyncMessageFoldersService } from 'src/modules/messaging/message-folder-manager/services/sync-message-folders.service';
import {
  MessageImportExceptionHandlerService,
  MessageImportSyncStep,
} from 'src/modules/messaging/message-import-manager/services/messaging-import-exception-handler.service';
import { type MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';
import { type MessagingCursorService } from 'src/modules/messaging/message-import-manager/services/messaging-cursor.service';
import { type MessagingGetMessageListService } from 'src/modules/messaging/message-import-manager/services/messaging-get-message-list.service';
import { MessagingMessageListFetchService } from 'src/modules/messaging/message-import-manager/services/messaging-message-list-fetch.service';
import { type MessagingMessagesImportService } from 'src/modules/messaging/message-import-manager/services/messaging-messages-import.service';
import { type MessagingProcessFolderActionsService } from 'src/modules/messaging/message-import-manager/services/messaging-process-folder-actions.service';
import { type MessagingProcessGroupEmailActionsService } from 'src/modules/messaging/message-import-manager/services/messaging-process-group-email-actions.service';

const WORKSPACE_ID = 'workspace-1';
const MESSAGE_CHANNEL_ID = 'message-channel-1';
const QUEUE_KEY = `messages-to-import:${WORKSPACE_ID}:${MESSAGE_CHANNEL_ID}`;

describe('MessagingMessageListFetchService', () => {
  let cacheStorage: {
    del: jest.Mock;
    setAdd: jest.Mock;
    setRemove: jest.Mock;
    getSetLength: jest.Mock;
    expire: jest.Mock;
    queuedIds: () => string[];
    seedQueue: (ids: string[]) => void;
  };
  let messageChannelSyncStatusService: {
    markAsMessagesListFetchOngoing: jest.Mock;
    markAsMessageSyncCompleted: jest.Mock;
    markAsMessagesImportScheduled: jest.Mock;
  };
  let messageChannelRepository: { findOne: jest.Mock };
  let messagingGetMessageListService: { getMessageLists: jest.Mock };
  let messageImportErrorHandlerService: { handleDriverException: jest.Mock };
  let messagingMessageCleanerService: {
    deleteMessagesChannelMessageAssociationsAndRelatedOrphans: jest.Mock;
  };
  let messagingCursorService: { updateCursor: jest.Mock };
  let messagingMessagesImportService: { processMessageBatchImport: jest.Mock };
  let syncMessageFoldersService: { syncMessageFolders: jest.Mock };
  let messagingProcessGroupEmailActionsService: {
    processGroupEmailActions: jest.Mock;
  };
  let messagingProcessFolderActionsService: {
    processFolderActions: jest.Mock;
    markFolderImportsAsCompleted: jest.Mock;
  };
  let workspaceOrmManager: {
    executeInWorkspaceContext: jest.Mock;
    getRepository: jest.Mock;
  };
  let service: MessagingMessageListFetchService;

  const buildMessageChannel = (
    overrides: Record<string, unknown> = {},
  ): MessageChannelEntity =>
    ({
      id: MESSAGE_CHANNEL_ID,
      workspaceId: WORKSPACE_ID,
      connectedAccountId: 'connected-account-1',
      connectedAccount: {
        id: 'connected-account-1',
        provider: 'GOOGLE',
      },
      syncCursor: 'sync-cursor-1',
      syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_SCHEDULED,
      syncStatus: MessageChannelSyncStatus.ONGOING,
      throttleFailureCount: 0,
      pendingGroupEmailsAction: MessageChannelPendingGroupEmailsAction.NONE,
      messageFolders: [],
      ...overrides,
    }) as unknown as MessageChannelEntity;

  const buildMessageList = (
    overrides: Record<string, unknown> = {},
  ): Record<string, unknown> => ({
    messageExternalIds: [],
    messageExternalIdsToDelete: [],
    previousSyncCursor: 'sync-cursor-1',
    nextSyncCursor: 'sync-cursor-2',
    folderId: undefined,
    ...overrides,
  });

  const seedQueue = (ids: string[]) => {
    cacheStorage.seedQueue(ids);
  };

  const queuedIds = () => cacheStorage.queuedIds();

  beforeEach(() => {
    const sets = new Map<string, Set<string>>();

    cacheStorage = {
      del: jest.fn(async (key: string) => {
        sets.delete(key);
      }),
      setAdd: jest.fn(async (key: string, values: string[]) => {
        if (values.length === 0) {
          return;
        }

        const set = sets.get(key) ?? new Set<string>();

        values.forEach((value) => set.add(value));
        sets.set(key, set);
      }),
      setRemove: jest.fn(async (key: string, values: string[]) => {
        const set = sets.get(key);

        if (!set) {
          return 0;
        }

        let removedCount = 0;

        for (const value of values) {
          if (set.delete(value)) {
            removedCount += 1;
          }
        }

        return removedCount;
      }),
      getSetLength: jest.fn(async (key: string) => sets.get(key)?.size ?? 0),
      expire: jest.fn(async () => true),
      queuedIds: () => [...(sets.get(QUEUE_KEY) ?? [])],
      seedQueue: (ids: string[]) => sets.set(QUEUE_KEY, new Set(ids)),
    };

    messageChannelSyncStatusService = {
      markAsMessagesListFetchOngoing: jest.fn(),
      markAsMessageSyncCompleted: jest.fn(),
      markAsMessagesImportScheduled: jest.fn(),
    };
    messageChannelRepository = { findOne: jest.fn() };
    messagingGetMessageListService = { getMessageLists: jest.fn() };
    messageImportErrorHandlerService = { handleDriverException: jest.fn() };
    messagingMessageCleanerService = {
      deleteMessagesChannelMessageAssociationsAndRelatedOrphans: jest.fn(),
    };
    messagingCursorService = { updateCursor: jest.fn() };
    messagingMessagesImportService = { processMessageBatchImport: jest.fn() };
    syncMessageFoldersService = {
      syncMessageFolders: jest.fn().mockResolvedValue([]),
    };
    messagingProcessGroupEmailActionsService = {
      processGroupEmailActions: jest.fn(),
    };
    messagingProcessFolderActionsService = {
      processFolderActions: jest.fn(),
      markFolderImportsAsCompleted: jest.fn(),
    };
    workspaceOrmManager = {
      executeInWorkspaceContext: jest.fn(
        async (callback: () => Promise<void>) => await callback(),
      ),
      getRepository: jest.fn().mockReturnValue({
        find: jest.fn().mockResolvedValue([]),
        findOne: jest.fn().mockResolvedValue(null),
      }),
    };

    service = new MessagingMessageListFetchService(
      cacheStorage as unknown as CacheStorageService,
      messageChannelSyncStatusService as unknown as MessageChannelSyncStatusService,
      workspaceOrmManager as unknown as WorkspaceOrmManager,
      messageChannelRepository as unknown as Repository<MessageChannelEntity>,
      messagingGetMessageListService as unknown as MessagingGetMessageListService,
      messageImportErrorHandlerService as unknown as MessageImportExceptionHandlerService,
      messagingMessageCleanerService as unknown as MessagingMessageCleanerService,
      messagingCursorService as unknown as MessagingCursorService,
      messagingMessagesImportService as unknown as MessagingMessagesImportService,
      syncMessageFoldersService as unknown as SyncMessageFoldersService,
      messagingProcessGroupEmailActionsService as unknown as MessagingProcessGroupEmailActionsService,
      messagingProcessFolderActionsService as unknown as MessagingProcessFolderActionsService,
    );
  });

  it('keeps an already queued backfill instead of resetting the import queue', async () => {
    seedQueue(['backlogged-id']);
    messagingGetMessageListService.getMessageLists.mockResolvedValue([
      buildMessageList(),
    ]);

    await service.processMessageListFetch(buildMessageChannel(), WORKSPACE_ID);

    expect(cacheStorage.del).not.toHaveBeenCalled();
    expect(queuedIds()).toEqual(['backlogged-id']);
    expect(
      messageChannelSyncStatusService.markAsMessageSyncCompleted,
    ).not.toHaveBeenCalled();
    expect(
      messageChannelSyncStatusService.markAsMessagesImportScheduled,
    ).toHaveBeenCalledWith([MESSAGE_CHANNEL_ID], WORKSPACE_ID);
    expect(
      messagingMessagesImportService.processMessageBatchImport,
    ).toHaveBeenCalledTimes(1);
  });

  it('marks the sync completed when nothing is left to import', async () => {
    messagingGetMessageListService.getMessageLists.mockResolvedValue([
      buildMessageList(),
    ]);

    await service.processMessageListFetch(buildMessageChannel(), WORKSPACE_ID);

    expect(cacheStorage.del).not.toHaveBeenCalled();
    expect(
      messageChannelSyncStatusService.markAsMessageSyncCompleted,
    ).toHaveBeenCalledWith([MESSAGE_CHANNEL_ID], WORKSPACE_ID);
    expect(
      messagingMessagesImportService.processMessageBatchImport,
    ).not.toHaveBeenCalled();
  });

  it('drops only the ids gmail reported as deleted', async () => {
    seedQueue(['still-relevant-id', 'deleted-upstream-id']);
    messagingGetMessageListService.getMessageLists.mockResolvedValue([
      buildMessageList({
        messageExternalIds: ['brand-new-id'],
        messageExternalIdsToDelete: ['deleted-upstream-id'],
      }),
    ]);

    await service.processMessageListFetch(buildMessageChannel(), WORKSPACE_ID);

    expect(cacheStorage.del).not.toHaveBeenCalled();
    expect(cacheStorage.setRemove).toHaveBeenCalledWith(QUEUE_KEY, [
      'deleted-upstream-id',
    ]);
    expect(queuedIds().sort()).toEqual(['brand-new-id', 'still-relevant-id']);
    expect(
      messagingMessageCleanerService.deleteMessagesChannelMessageAssociationsAndRelatedOrphans,
    ).toHaveBeenCalledTimes(1);
  });

  it('clears the folder import action once its ids are queued', async () => {
    const messageChannel = buildMessageChannel({
      messageFolders: [
        {
          id: 'folder-1',
          pendingSyncAction: MessageFolderPendingSyncAction.FOLDER_IMPORT,
          externalId: 'Label_A',
          name: 'label-a',
        },
      ],
    });

    messageChannelRepository.findOne.mockResolvedValue(messageChannel);
    messagingProcessFolderActionsService.processFolderActions.mockResolvedValue(
      {
        messageExternalIdsToImport: ['folder-message-id'],
        completedImportFolderIds: ['folder-1'],
      },
    );
    messagingGetMessageListService.getMessageLists.mockResolvedValue([
      buildMessageList(),
    ]);

    await service.processMessageListFetch(messageChannel, WORKSPACE_ID);

    expect(queuedIds()).toEqual(['folder-message-id']);
    expect(
      messagingProcessFolderActionsService.markFolderImportsAsCompleted,
    ).toHaveBeenCalledWith(['folder-1'], WORKSPACE_ID);
  });

  it('leaves the folder import action pending when the list fetch fails', async () => {
    seedQueue(['backlogged-id']);
    const messageChannel = buildMessageChannel({
      messageFolders: [
        {
          id: 'folder-1',
          pendingSyncAction: MessageFolderPendingSyncAction.FOLDER_IMPORT,
          externalId: 'Label_A',
          name: 'label-a',
        },
      ],
    });
    const listFetchError = new Error('rateLimitExceeded');

    messageChannelRepository.findOne.mockResolvedValue(messageChannel);
    messagingProcessFolderActionsService.processFolderActions.mockResolvedValue(
      {
        messageExternalIdsToImport: ['folder-message-id'],
        completedImportFolderIds: ['folder-1'],
      },
    );
    messagingGetMessageListService.getMessageLists.mockRejectedValue(
      listFetchError,
    );

    await service.processMessageListFetch(messageChannel, WORKSPACE_ID);

    expect(
      messagingProcessFolderActionsService.markFolderImportsAsCompleted,
    ).not.toHaveBeenCalled();
    expect(cacheStorage.del).not.toHaveBeenCalled();
    expect(queuedIds()).toEqual(['backlogged-id']);
    expect(
      messageImportErrorHandlerService.handleDriverException,
    ).toHaveBeenCalledWith(
      listFetchError,
      MessageImportSyncStep.MESSAGE_LIST_FETCH,
      messageChannel,
      WORKSPACE_ID,
    );
  });
});
