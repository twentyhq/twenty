import { Logger, Provider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { BlocklistRepository } from 'src/modules/blocklist/repositories/blocklist.repository';
import { EmailAliasManagerService } from 'src/modules/connected-account/email-alias-manager/services/email-alias-manager.service';
import { ConnectedAccountRefreshTokensService } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import {
  MessageChannelSyncStage,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MESSAGING_GMAIL_USERS_MESSAGES_GET_BATCH_SIZE } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-users-messages-get-batch-size.constant';
import { MessagingGetMessagesService } from 'src/modules/messaging/message-import-manager/services/messaging-get-messages.service';
import { MessageImportExceptionHandlerService } from 'src/modules/messaging/message-import-manager/services/messaging-import-exception-handler.service';
import { MessagingMessagesImportService } from 'src/modules/messaging/message-import-manager/services/messaging-messages-import.service';
import { MessagingSaveMessagesAndEnqueueContactCreationService } from 'src/modules/messaging/message-import-manager/services/messaging-save-messages-and-enqueue-contact-creation.service';
import { MessagingTelemetryService } from 'src/modules/messaging/monitoring/services/messaging-telemetry.service';

describe('MessagingMessagesImportService', () => {
  let service: MessagingMessagesImportService;
  let messageChannelSyncStatusService: MessageChannelSyncStatusService;
  let connectedAccountRefreshTokensService: ConnectedAccountRefreshTokensService;
  let emailAliasManagerService: EmailAliasManagerService;
  let messagingGetMessagesService: MessagingGetMessagesService;
  let saveMessagesService: MessagingSaveMessagesAndEnqueueContactCreationService;

  const workspaceId = 'workspace-id';
  let mockMessageChannel: MessageChannelWorkspaceEntity;
  let mockConnectedAccount: ConnectedAccountWorkspaceEntity;
  let providersBase: Provider[];

  beforeEach(async () => {
    mockConnectedAccount = {
      id: 'connected-account-id',
      provider: ConnectedAccountProvider.GOOGLE,
      handle: 'test@gmail.com',
      refreshToken: 'refresh-token',
      accessToken: 'old-access-token',
      accountOwnerId: 'account-owner-id',
      handleAliases: 'alias1@gmail.com,alias2@gmail.com',
    } as ConnectedAccountWorkspaceEntity;

    mockMessageChannel = {
      id: 'message-channel-id',
      syncStage: MessageChannelSyncStage.MESSAGES_IMPORT_PENDING,
      connectedAccountId: mockConnectedAccount.id,
      handle: 'test@gmail.com',
    } as MessageChannelWorkspaceEntity;

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
          markAsCompletedAndSchedulePartialMessageListFetch: jest
            .fn()
            .mockResolvedValue(undefined),
          scheduleMessagesImport: jest.fn().mockResolvedValue(undefined),
        },
      },
      {
        provide: ConnectedAccountRefreshTokensService,
        useValue: {
          refreshAndSaveTokens: jest.fn().mockResolvedValue('new-access-token'),
        },
      },
      {
        provide: MessagingTelemetryService,
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
          refreshHandleAliases: jest.fn().mockResolvedValue(undefined),
        },
      },
      {
        provide: TwentyORMManager,
        useValue: {
          getRepository: jest.fn().mockResolvedValue({
            update: jest.fn().mockResolvedValue(undefined),
          }),
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

  it('should fails if SyncStage is not MESSAGES_IMPORT_PENDING', async () => {
    mockMessageChannel.syncStage =
      MessageChannelSyncStage.PARTIAL_MESSAGE_LIST_FETCH_PENDING;

    expect(
      service.processMessageBatchImport(
        mockMessageChannel,
        mockConnectedAccount,
        workspaceId,
      ),
    ).resolves.toBeFalsy();
  });

  it('should process message batch import successfully', async () => {
    await service.processMessageBatchImport(
      mockMessageChannel,
      mockConnectedAccount,
      workspaceId,
    );
    expect(
      messageChannelSyncStatusService.markAsMessagesImportOngoing,
    ).toHaveBeenCalledWith([mockMessageChannel.id]);
    expect(
      connectedAccountRefreshTokensService.refreshAndSaveTokens,
    ).toHaveBeenCalledWith(mockConnectedAccount, workspaceId);
    expect(emailAliasManagerService.refreshHandleAliases).toHaveBeenCalledWith(
      mockConnectedAccount,
    );
    expect(messagingGetMessagesService.getMessages).toHaveBeenCalledWith(
      ['message-id-1', 'message-id-2'],
      mockConnectedAccount,
      workspaceId,
    );
    expect(
      saveMessagesService.saveMessagesAndEnqueueContactCreation,
    ).toHaveBeenCalled();
    expect(
      messageChannelSyncStatusService.scheduleMessagesImport,
    ).toHaveBeenCalledTimes(0);
  });

  it('should process message batch import of more than MESSAGING_GMAIL_USERS_MESSAGES_GET_BATCH_SIZE successfully', async () => {
    const arrayMessagesBig = Array.from(
      { length: MESSAGING_GMAIL_USERS_MESSAGES_GET_BATCH_SIZE + 1 },
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
      mockMessageChannel,
      mockConnectedAccount,
      workspaceId,
    );

    expect(
      messageChannelSyncStatusService.scheduleMessagesImport,
    ).toHaveBeenCalledTimes(1);
  });
});
