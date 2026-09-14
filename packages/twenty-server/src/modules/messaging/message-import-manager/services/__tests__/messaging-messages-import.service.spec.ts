import { MessageChannelSyncStage } from 'twenty-shared/types';
import { type Repository } from 'typeorm';

import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { BlocklistRepository } from 'src/modules/blocklist/repositories/blocklist.repository';
import { EmailAliasManagerService } from 'src/modules/connected-account/email-alias-manager/services/email-alias-manager.service';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { MessagingGetMessagesService } from 'src/modules/messaging/message-import-manager/services/messaging-get-messages.service';
import { MessageImportExceptionHandlerService } from 'src/modules/messaging/message-import-manager/services/messaging-import-exception-handler.service';
import { MessagingMessagesImportService } from 'src/modules/messaging/message-import-manager/services/messaging-messages-import.service';
import { MessagingSaveMessagesAndEnqueueContactCreationService } from 'src/modules/messaging/message-import-manager/services/messaging-save-messages-and-enqueue-contact-creation.service';
import { messagingGetMessagesServiceGetMessages } from 'src/modules/messaging/message-import-manager/utils/__mocks__/messages';
import { MessagingMonitoringService } from 'src/modules/messaging/monitoring/services/messaging-monitoring.service';

describe('MessagingMessagesImportService', () => {
  let service: MessagingMessagesImportService;
  let cacheStorage: { setPop: jest.Mock; setAdd: jest.Mock };
  let messageChannelSyncStatusService: {
    markAsMessagesImportOngoing: jest.Mock;
    markAsMessageSyncCompleted: jest.Mock;
    markAsMessagesImportPending: jest.Mock;
  };
  let saveMessagesAndEnqueueContactCreationService: {
    saveMessagesAndEnqueueContactCreation: jest.Mock;
  };
  let messagingMonitoringService: { track: jest.Mock };
  let blocklistRepository: { getByWorkspaceMemberId: jest.Mock };
  let emailAliasManagerService: { refreshHandleAliases: jest.Mock };
  let workspaceOrmManager: {
    executeInWorkspaceContext: jest.Mock;
    getRepository: jest.Mock;
  };
  let messageChannelRepository: { update: jest.Mock };
  let messagingGetMessagesService: { getMessages: jest.Mock };
  let messageImportErrorHandlerService: { handleDriverException: jest.Mock };
  let userWorkspaceRepository: { findOne: jest.Mock };
  let workspaceRepository: { findOne: jest.Mock };
  let twentyConfigService: { get: jest.Mock };
  let mockAssociationRepository: { find: jest.Mock; insert: jest.Mock };
  let mockWorkspaceMemberRepository: { findOne: jest.Mock };

  const workspaceId = 'workspace-1';
  const mockMessageChannel = {
    id: 'channel-1',
    handle: 'guillim@acme.com',
    syncStage: MessageChannelSyncStage.MESSAGES_IMPORT_SCHEDULED,
    connectedAccountId: 'account-1',
    messageFolders: [],
    excludeGroupEmails: true,
  } as unknown as MessageChannelEntity;

  const mockConnectedAccount = {
    id: 'account-1',
    handle: 'guillim@acme.com',
    handleAliases: [],
    userWorkspaceId: 'user-workspace-1',
  } as unknown as ConnectedAccountEntity;

  beforeEach(() => {
    cacheStorage = {
      setPop: jest.fn(),
      setAdd: jest.fn(),
    };
    messageChannelSyncStatusService = {
      markAsMessagesImportOngoing: jest.fn(),
      markAsMessageSyncCompleted: jest.fn(),
      markAsMessagesImportPending: jest.fn(),
    };
    saveMessagesAndEnqueueContactCreationService = {
      saveMessagesAndEnqueueContactCreation: jest.fn(),
    };
    messagingMonitoringService = { track: jest.fn() };
    blocklistRepository = {
      getByWorkspaceMemberId: jest.fn().mockResolvedValue([]),
    };
    emailAliasManagerService = {
      refreshHandleAliases: jest.fn().mockResolvedValue([]),
    };
    mockAssociationRepository = {
      find: jest.fn().mockResolvedValue([]),
      insert: jest.fn().mockResolvedValue(undefined),
    };
    mockWorkspaceMemberRepository = {
      findOne: jest.fn().mockResolvedValue({ id: 'member-1' }),
    };
    workspaceOrmManager = {
      executeInWorkspaceContext: jest.fn(async (cb) => cb()),
      getRepository: jest.fn((name: string) => {
        if (name === 'messageChannelMessageAssociation') {
          return mockAssociationRepository;
        }
        if (name === 'workspaceMember') {
          return mockWorkspaceMemberRepository;
        }

        return {};
      }),
    };
    messageChannelRepository = {
      update: jest.fn().mockResolvedValue(undefined),
    };
    messagingGetMessagesService = { getMessages: jest.fn() };
    messageImportErrorHandlerService = { handleDriverException: jest.fn() };
    userWorkspaceRepository = {
      findOne: jest.fn().mockResolvedValue({ userId: 'user-1' }),
    };
    workspaceRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: workspaceId,
        isInternalMessagesImportEnabled: false,
      }),
    };
    twentyConfigService = { get: jest.fn().mockReturnValue(400) };

    service = new MessagingMessagesImportService(
      cacheStorage as unknown as CacheStorageService,
      messageChannelSyncStatusService as unknown as MessageChannelSyncStatusService,
      saveMessagesAndEnqueueContactCreationService as unknown as MessagingSaveMessagesAndEnqueueContactCreationService,
      messagingMonitoringService as unknown as MessagingMonitoringService,
      blocklistRepository as unknown as BlocklistRepository,
      emailAliasManagerService as unknown as EmailAliasManagerService,
      workspaceOrmManager as unknown as WorkspaceOrmManager,
      messageChannelRepository as unknown as Repository<MessageChannelEntity>,
      messagingGetMessagesService as unknown as MessagingGetMessagesService,
      messageImportErrorHandlerService as unknown as MessageImportExceptionHandlerService,
      userWorkspaceRepository as unknown as Repository<UserWorkspaceEntity>,
      workspaceRepository as unknown as Repository<WorkspaceEntity>,
      twentyConfigService as unknown as TwentyConfigService,
    );
  });

  it('persists placeholder associations when a batch is entirely filtered out (issue #25817)', async () => {
    const internalMessages = messagingGetMessagesServiceGetMessages.filter(
      (msg) => msg.externalId === 'AA-work-emails-internal',
    );

    cacheStorage.setPop.mockResolvedValue(['AA-work-emails-internal']);
    messagingGetMessagesService.getMessages.mockResolvedValue(internalMessages);
    mockAssociationRepository.find.mockResolvedValue([]);

    await service.processMessageBatchImport(
      mockMessageChannel,
      mockConnectedAccount,
      workspaceId,
      400,
    );

    expect(
      saveMessagesAndEnqueueContactCreationService.saveMessagesAndEnqueueContactCreation,
    ).not.toHaveBeenCalled();

    expect(mockAssociationRepository.insert).toHaveBeenCalledTimes(1);
    expect(mockAssociationRepository.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        messageChannelId: mockMessageChannel.id,
        messageExternalId: 'AA-work-emails-internal',
        messageThreadExternalId: null,
        messageId: null,
        direction: MessageDirection.OUTGOING,
      }),
    ]);

    expect(
      messageChannelSyncStatusService.markAsMessageSyncCompleted,
    ).toHaveBeenCalledWith([mockMessageChannel.id], workspaceId);
  });

  it('saves surviving messages and persists placeholder associations for filtered messages in a mixed batch', async () => {
    const mixedMessages = messagingGetMessagesServiceGetMessages.filter(
      (msg) =>
        msg.externalId === 'AA-work-emails-internal' ||
        msg.externalId === 'AA-work-emails-external',
    );

    cacheStorage.setPop.mockResolvedValue([
      'AA-work-emails-internal',
      'AA-work-emails-external',
    ]);
    messagingGetMessagesService.getMessages.mockResolvedValue(mixedMessages);
    mockAssociationRepository.find.mockResolvedValue([]);

    await service.processMessageBatchImport(
      mockMessageChannel,
      mockConnectedAccount,
      workspaceId,
      400,
    );

    expect(
      saveMessagesAndEnqueueContactCreationService.saveMessagesAndEnqueueContactCreation,
    ).toHaveBeenCalledTimes(1);
    expect(
      saveMessagesAndEnqueueContactCreationService.saveMessagesAndEnqueueContactCreation,
    ).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ externalId: 'AA-work-emails-external' }),
      ]),
      mockMessageChannel,
      mockConnectedAccount,
      workspaceId,
    );

    expect(mockAssociationRepository.insert).toHaveBeenCalledTimes(1);
    expect(mockAssociationRepository.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        messageChannelId: mockMessageChannel.id,
        messageExternalId: 'AA-work-emails-internal',
        messageThreadExternalId: null,
        messageId: null,
      }),
    ]);
  });

  it('does not insert duplicate associations if an association already exists for a filtered message', async () => {
    const internalMessages = messagingGetMessagesServiceGetMessages.filter(
      (msg) => msg.externalId === 'AA-work-emails-internal',
    );

    cacheStorage.setPop.mockResolvedValue(['AA-work-emails-internal']);
    messagingGetMessagesService.getMessages.mockResolvedValue(internalMessages);
    mockAssociationRepository.find.mockResolvedValue([
      { messageExternalId: 'AA-work-emails-internal' },
    ]);

    await service.processMessageBatchImport(
      mockMessageChannel,
      mockConnectedAccount,
      workspaceId,
      400,
    );

    expect(mockAssociationRepository.insert).not.toHaveBeenCalled();
  });
});
