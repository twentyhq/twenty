import { Logger, type Provider } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import {
  ConnectedAccountProvider,
  MessageChannelSyncStage,
  MessageFolderImportPolicy,
} from 'twenty-shared/types';

import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { BlocklistRepository } from 'src/modules/blocklist/repositories/blocklist.repository';
import { EmailAliasManagerService } from 'src/modules/connected-account/email-alias-manager/services/email-alias-manager.service';
import { ConnectedAccountRefreshTokensService } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { MessagingAccountAuthenticationService } from 'src/modules/messaging/message-import-manager/services/messaging-account-authentication.service';
import { MessagingGetMessagesService } from 'src/modules/messaging/message-import-manager/services/messaging-get-messages.service';
import { MessageImportExceptionHandlerService } from 'src/modules/messaging/message-import-manager/services/messaging-import-exception-handler.service';
import { MessagingMessagesImportService } from 'src/modules/messaging/message-import-manager/services/messaging-messages-import.service';
import { MessagingSaveMessagesAndEnqueueContactCreationService } from 'src/modules/messaging/message-import-manager/services/messaging-save-messages-and-enqueue-contact-creation.service';
import { getRepositoryToken } from '@nestjs/typeorm';

import { MessagingMonitoringService } from 'src/modules/messaging/monitoring/services/messaging-monitoring.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

describe('MessagingMessagesImportService', () => {
  let service: MessagingMessagesImportService;
  let messageChannelSyncStatusService: MessageChannelSyncStatusService;
  let connectedAccountRefreshTokensService: ConnectedAccountRefreshTokensService;
  let emailAliasManagerService: EmailAliasManagerService;
  let messagingGetMessagesService: MessagingGetMessagesService;
  let saveMessagesService: MessagingSaveMessagesAndEnqueueContactCreationService;

  const workspaceId = 'workspace-id';
  let mockMessageChannel: Pick<
    MessageChannelEntity,
    | 'id'
    | 'syncStage'
    | 'connectedAccountId'
    | 'handle'
    | 'messageFolders'
    | 'messageFolderImportPolicy'
  >;
  let mockConnectedAccount: ConnectedAccountEntity;
  let providersBase: Provider[];

  beforeEach(async () => {
    mockConnectedAccount = {
      id: 'connected-account-id',
      provider: ConnectedAccountProvider.GOOGLE,
      handle: 'test@gmail.com',
      refreshToken: 'refresh-token',
      accessToken: 'old-access-token',
      userWorkspaceId: 'user-workspace-id',
      handleAliases: ['alias1@gmail.com', 'alias2@gmail.com'],
    } as ConnectedAccountEntity;

    mockMessageChannel = {
      id: 'message-channel-id',
      syncStage: MessageChannelSyncStage.MESSAGES_IMPORT_SCHEDULED,
      connectedAccountId: mockConnectedAccount.id,
      handle: 'test@gmail.com',
      messageFolders: [],
      messageFolderImportPolicy: MessageFolderImportPolicy.ALL_FOLDERS,
    };

    providersBase = [
      MessagingMessagesImportService,
      {
        provide: CacheStorageService,
        useValue: {
          setAdd: jest.fn().mockResolvedValue(undefined),
        },
      },
      {
        provide: MessageChannelSyncStatusService,
        useValue: {
          markAsMessagesImportOngoing: jest.fn().mockResolvedValue(undefined),
          markAsCompletedAndMarkAsMessagesListFetchPending: jest
            .fn()
            .mockResolvedValue(undefined),
          markAsMessagesImportPending: jest.fn().mockResolvedValue(undefined),
        },
      },
      {
        provide: ConnectedAccountRefreshTokensService,
        useValue: {
          refreshAndSaveTokens: jest.fn().mockResolvedValue({
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token',
          }),
        },
      },
      {
        provide: MessagingMonitoringService,
        useValue: {
          track: jest.fn().mockResolvedValue(undefined),
        },
      },
      {
        provide: 'BlocklistRepository',
        useValue: {
          getByWorkspaceMemberId: jest.fn().mockResolvedValue([]),
        },
      },
      {
        provide: BlocklistRepository,
        useValue: {
          getByWorkspaceMemberId: jest.fn().mockResolvedValue([]),
        },
      },
      {
        provide: EmailAliasManagerService,
        useValue: {
          refreshHandleAliases: jest
            .fn()
            .mockResolvedValue(['alias1@gmail.com', 'alias2@gmail.com']),
        },
      },
      {
        provide: GlobalWorkspaceOrmManager,
        useValue: {
          getRepository: jest.fn().mockResolvedValue({
            update: jest.fn().mockResolvedValue(undefined),
            findOne: jest.fn().mockResolvedValue({
              id: 'workspace-member-id',
              userId: 'user-id',
            }),
          }),
          executeInWorkspaceContext: jest
            .fn()
            .mockImplementation((fn: () => any, _authContext?: any) => fn()),
        },
      },
      {
        provide: getRepositoryToken(MessageChannelEntity),
        useValue: {
          update: jest.fn().mockResolvedValue(undefined),
        },
      },
      {
        provide: MessagingGetMessagesService,
        useValue: {
          getMessages: jest.fn().mockResolvedValue([
            {
              id: 'message-1',
              from: 'sender@example.com',
              to: 'test@gmail.com',
            },
            {
              id: 'message-2',
              from: 'test@gmail.com',
              to: 'recipient@example.com',
            },
          ]),
        },
      },
      {
        provide: MessagingSaveMessagesAndEnqueueContactCreationService,
        useValue: {
          saveMessagesAndEnqueueContactCreation: jest
            .fn()
            .mockResolvedValue(undefined),
        },
      },
      {
        provide: MessageImportExceptionHandlerService,
        useValue: {
          handleDriverException: jest.fn().mockResolvedValue(undefined),
        },
      },
      {
        provide: MessagingAccountAuthenticationService,
        useClass: MessagingAccountAuthenticationService,
      },
      {
        provide: getRepositoryToken(UserWorkspaceEntity),
        useValue: {
          findOne: jest.fn().mockResolvedValue({ userId: 'user-id' }),
        },
      },
      {
        provide: getRepositoryToken(WorkspaceEntity),
        useValue: {
          findOne: jest
            .fn()
            .mockResolvedValue({ isInternalMessagesImportEnabled: false }),
        },
      },
      {
        provide: TwentyConfigService,
        useValue: {
          get: jest.fn().mockReturnValue(400),
        },
      },
    ];
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ...providersBase,
        {
          provide: CacheStorageNamespace.ModuleMessaging,
          useValue: {
            setPop: jest
              .fn()
              .mockResolvedValue(['message-id-1', 'message-id-2']),
            setAdd: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    })
      .overrideProvider(Logger)
      .useValue({ log: jest.fn() })
      .compile();

    service = module.get<MessagingMessagesImportService>(
      MessagingMessagesImportService,
    );

    messageChannelSyncStatusService =
      module.get<MessageChannelSyncStatusService>(
        MessageChannelSyncStatusService,
      );
    connectedAccountRefreshTokensService =
      module.get<ConnectedAccountRefreshTokensService>(
        ConnectedAccountRefreshTokensService,
      );
    emailAliasManagerService = module.get<EmailAliasManagerService>(
      EmailAliasManagerService,
    );
    messagingGetMessagesService = module.get<MessagingGetMessagesService>(
      MessagingGetMessagesService,
    );

    saveMessagesService =
      module.get<MessagingSaveMessagesAndEnqueueContactCreationService>(
        MessagingSaveMessagesAndEnqueueContactCreationService,
      );
  });

  it('should fails if SyncStage is not MESSAGES_IMPORT_SCHEDULED', async () => {
    mockMessageChannel.syncStage =
      MessageChannelSyncStage.MESSAGES_IMPORT_PENDING;

    expect(
      service.processMessageBatchImport(
        mockMessageChannel as MessageChannelEntity,
        mockConnectedAccount,
        workspaceId,
      ),
    ).resolves.toBeFalsy();
  });

  it('should process message batch import successfully', async () => {
    await service.processMessageBatchImport(
      mockMessageChannel as MessageChannelEntity,
      mockConnectedAccount,
      workspaceId,
    );
    expect(
      messageChannelSyncStatusService.markAsMessagesImportOngoing,
    ).toHaveBeenCalledWith([mockMessageChannel.id], workspaceId);

    expect(
      connectedAccountRefreshTokensService.refreshAndSaveTokens,
    ).toHaveBeenCalledWith(mockConnectedAccount, workspaceId);

    expect(emailAliasManagerService.refreshHandleAliases).toHaveBeenCalledWith(
      {
        ...mockConnectedAccount,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      },
      workspaceId,
    );
    expect(messagingGetMessagesService.getMessages).toHaveBeenCalledWith(
      ['message-id-1', 'message-id-2'],
      {
        ...mockConnectedAccount,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      },
      mockMessageChannel,
    );
    expect(
      saveMessagesService.saveMessagesAndEnqueueContactCreation,
    ).toHaveBeenCalled();
    expect(
      messageChannelSyncStatusService.markAsMessagesImportPending,
    ).toHaveBeenCalledTimes(0);
  });

  it('should process message batch import of more than MESSAGING_GMAIL_USERS_MESSAGES_GET_BATCH_SIZE successfully', async () => {
    const arrayMessagesBig = Array.from(
      { length: 401 },
      (_, index) => `message-id-${index + 1}`,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ...providersBase,
        {
          provide: CacheStorageNamespace.ModuleMessaging,
          useValue: {
            setPop: jest.fn().mockResolvedValue(arrayMessagesBig),
            setAdd: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    })
      .overrideProvider(Logger)
      .useValue({ log: jest.fn() })
      .compile();

    service = module.get<MessagingMessagesImportService>(
      MessagingMessagesImportService,
    );

    messageChannelSyncStatusService =
      module.get<MessageChannelSyncStatusService>(
        MessageChannelSyncStatusService,
      );
    connectedAccountRefreshTokensService =
      module.get<ConnectedAccountRefreshTokensService>(
        ConnectedAccountRefreshTokensService,
      );
    emailAliasManagerService = module.get<EmailAliasManagerService>(
      EmailAliasManagerService,
    );
    messagingGetMessagesService = module.get<MessagingGetMessagesService>(
      MessagingGetMessagesService,
    );

    saveMessagesService =
      module.get<MessagingSaveMessagesAndEnqueueContactCreationService>(
        MessagingSaveMessagesAndEnqueueContactCreationService,
      );

    await service.processMessageBatchImport(
      mockMessageChannel as MessageChannelEntity,
      mockConnectedAccount,
      workspaceId,
    );

    expect(
      messageChannelSyncStatusService.markAsMessagesImportPending,
    ).toHaveBeenCalledTimes(1);
  });
});
