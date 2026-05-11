import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import {
  CalendarChannelSyncStage,
  ConnectedAccountProvider,
  MessageChannelSyncStage,
} from 'twenty-shared/types';

import { CreateCalendarChannelService } from 'src/engine/core-modules/auth/services/create-calendar-channel.service';
import { CreateMessageChannelService } from 'src/engine/core-modules/auth/services/create-message-channel.service';
import { type EmailAccountConnectionParameters } from 'src/engine/core-modules/imap-smtp-caldav-connection/dtos/imap-smtp-caldav-connection.dto';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';
import { CalendarEventListFetchJob } from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-event-list-fetch.job';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';
import { ImapSmtpCalDavAPIService } from 'src/modules/connected-account/services/imap-smtp-caldav-apis.service';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { MessagingMessageListFetchJob } from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';
import { SyncMessageFoldersService } from 'src/modules/messaging/message-folder-manager/services/sync-message-folders.service';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

jest.mock(
  'src/engine/twenty-orm/storage/orm-workspace-context.storage',
  () => ({
    getWorkspaceContext: jest.fn(() => ({
      authContext: { type: 'user', workspace: { id: 'workspace-id' } },
      userWorkspaceRoleMap: {},
      apiKeyRoleMap: {},
    })),
  }),
);

jest.mock(
  'src/engine/twenty-orm/utils/resolve-role-permission-config.util',
  () => ({
    resolveRolePermissionConfig: jest.fn(() => ({
      intersectionOf: ['role-id'],
    })),
  }),
);

describe('ImapSmtpCalDavAPIService', () => {
  let service: ImapSmtpCalDavAPIService;

  const mockTransactionManagerSave = jest.fn();
  const mockTransactionManager = {
    getRepository: jest.fn().mockReturnValue({
      save: mockTransactionManagerSave,
    }),
  };

  const mockConnectedAccountRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    manager: {
      transaction: jest.fn((callback) => callback(mockTransactionManager)),
    },
  };

  const mockMessageChannelRepository = {
    findOne: jest.fn(),
  };

  const mockCalendarChannelRepository = {
    findOne: jest.fn(),
  };

  const mockUserWorkspaceRepository = {
    findOne: jest.fn().mockResolvedValue({ id: 'user-workspace-id' }),
  };

  const mockWorkspaceMemberRepository = {
    findOne: jest.fn().mockResolvedValue({
      id: 'workspace-member-id',
      userId: 'user-id',
    }),
  };

  const mockCreateMessageChannelService = {
    createMessageChannel: jest.fn().mockResolvedValue('mocked-uuid'),
  };

  const mockCreateCalendarChannelService = {
    createCalendarChannel: jest.fn().mockResolvedValue('mocked-uuid'),
  };

  const mockMessageQueueService = {
    add: jest.fn(),
  };

  const mockCalendarQueueService = {
    add: jest.fn(),
  };

  const mockAccountsToReconnectService = {
    removeAccountToReconnect: jest.fn(),
  };

  const mockMessagingChannelSyncStatusService = {
    resetAndMarkAsMessagesListFetchPending: jest.fn(),
  };

  const mockCalendarChannelSyncStatusService = {
    resetAndMarkAsCalendarEventListFetchPending: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImapSmtpCalDavAPIService,
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: {
            getRepository: jest
              .fn()
              .mockImplementation((_workspaceId, entity) => {
                if (entity === 'workspaceMember')
                  return mockWorkspaceMemberRepository;

                return {};
              }),
            executeInWorkspaceContext: jest
              .fn()

              .mockImplementation((fn: () => any, _authContext?: any) => fn()),
          },
        },
        {
          provide: CreateMessageChannelService,
          useValue: mockCreateMessageChannelService,
        },
        {
          provide: CreateCalendarChannelService,
          useValue: mockCreateCalendarChannelService,
        },
        {
          provide: getRepositoryToken(ConnectedAccountEntity),
          useValue: mockConnectedAccountRepository,
        },
        {
          provide: getRepositoryToken(MessageChannelEntity),
          useValue: mockMessageChannelRepository,
        },
        {
          provide: getRepositoryToken(CalendarChannelEntity),
          useValue: mockCalendarChannelRepository,
        },
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: mockUserWorkspaceRepository,
        },
        {
          provide: SyncMessageFoldersService,
          useValue: {
            syncMessageFolders: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getQueueToken(MessageQueue.messagingQueue),
          useValue: mockMessageQueueService,
        },
        {
          provide: getQueueToken(MessageQueue.calendarQueue),
          useValue: mockCalendarQueueService,
        },
        {
          provide: AccountsToReconnectService,
          useValue: mockAccountsToReconnectService,
        },
        {
          provide: MessageChannelSyncStatusService,
          useValue: mockMessagingChannelSyncStatusService,
        },
        {
          provide: CalendarChannelSyncStatusService,
          useValue: mockCalendarChannelSyncStatusService,
        },
      ],
    }).compile();

    service = module.get<ImapSmtpCalDavAPIService>(ImapSmtpCalDavAPIService);

    jest.clearAllMocks();
  });

  describe('processAccount', () => {
    const baseInput = {
      handle: 'test@example.com',
      workspaceMemberId: 'workspace-member-id',
      workspaceId: 'workspace-id',
      connectionParameters: {
        IMAP: {
          host: 'imap.example.com',
          port: 993,
          secure: true,
          password: 'password',
        },
        SMTP: {
          host: 'smtp.example.com',
          port: 587,
          secure: true,
          username: 'test@example.com',
          password: 'password',
        },
      } as EmailAccountConnectionParameters,
    };

    it('should create new account with message channel when account does not exist and IMAP is configured', async () => {
      mockConnectedAccountRepository.findOne.mockResolvedValue(null);
      mockMessageChannelRepository.findOne.mockResolvedValue(null);
      mockCalendarChannelRepository.findOne.mockResolvedValue(null);
      mockWorkspaceMemberRepository.findOne.mockResolvedValue({
        id: 'workspace-member-id',
        userId: 'user-id',
      });
      mockUserWorkspaceRepository.findOne.mockResolvedValue({
        id: 'user-workspace-id',
      });

      await service.processAccount(baseInput);

      expect(mockTransactionManagerSave).toHaveBeenCalledWith({
        id: 'mocked-uuid',
        handle: 'test@example.com',
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        connectionParameters: baseInput.connectionParameters,
        userWorkspaceId: 'user-workspace-id',
        workspaceId: 'workspace-id',
        authFailedAt: null,
      });

      expect(
        mockCreateMessageChannelService.createMessageChannel,
      ).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        connectedAccountId: 'mocked-uuid',
        handle: 'test@example.com',
        transactionManager: mockTransactionManager,
      });

      expect(
        mockCreateCalendarChannelService.createCalendarChannel,
      ).not.toHaveBeenCalled();
    });

    it('should preserve existing channels when updating account credentials', async () => {
      const existingAccount = {
        id: 'existing-account-id',
        handle: 'test@example.com',
        userWorkspaceId: 'user-workspace-id',
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
      } as ConnectedAccountEntity;

      const existingMessageChannel = {
        id: 'existing-message-channel-id',
        connectedAccountId: 'existing-account-id',
        syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
      } as MessageChannelEntity;

      const existingCalendarChannel = {
        id: 'existing-calendar-channel-id',
        connectedAccountId: 'existing-account-id',
        syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
      } as CalendarChannelEntity;

      mockConnectedAccountRepository.findOne.mockResolvedValue(existingAccount);
      mockMessageChannelRepository.findOne.mockResolvedValue(
        existingMessageChannel,
      );
      mockCalendarChannelRepository.findOne.mockResolvedValue(
        existingCalendarChannel,
      );
      mockWorkspaceMemberRepository.findOne.mockResolvedValue({
        id: 'workspace-member-id',
        userId: 'user-id',
      });
      mockUserWorkspaceRepository.findOne.mockResolvedValue({
        id: 'user-workspace-id',
      });

      const inputWithConnectedAccountId = {
        ...baseInput,
        connectionParameters: {
          ...baseInput.connectionParameters,
          CALDAV: {
            host: 'caldav.example.com',
            port: 443,
            secure: true,
            username: 'test@example.com',
            password: 'password',
          },
        } as EmailAccountConnectionParameters,
        connectedAccountId: 'existing-account-id',
      };

      await service.processAccount(inputWithConnectedAccountId);

      expect(mockTransactionManagerSave).toHaveBeenCalledWith({
        id: 'existing-account-id',
        handle: 'test@example.com',
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        connectionParameters: inputWithConnectedAccountId.connectionParameters,
        userWorkspaceId: 'user-workspace-id',
        workspaceId: 'workspace-id',
        authFailedAt: null,
      });

      expect(
        mockCreateMessageChannelService.createMessageChannel,
      ).not.toHaveBeenCalled();
      expect(
        mockCreateCalendarChannelService.createCalendarChannel,
      ).not.toHaveBeenCalled();

      expect(
        mockAccountsToReconnectService.removeAccountToReconnect,
      ).toHaveBeenCalledWith('user-id', 'workspace-id', 'existing-account-id');

      expect(
        mockMessagingChannelSyncStatusService.resetAndMarkAsMessagesListFetchPending,
      ).toHaveBeenCalledWith(['existing-message-channel-id'], 'workspace-id');
      expect(mockMessageQueueService.add).toHaveBeenCalledWith(
        MessagingMessageListFetchJob.name,
        {
          workspaceId: 'workspace-id',
          messageChannelId: 'existing-message-channel-id',
        },
      );

      expect(
        mockCalendarChannelSyncStatusService.resetAndMarkAsCalendarEventListFetchPending,
      ).toHaveBeenCalledWith(['existing-calendar-channel-id'], 'workspace-id');
      expect(mockCalendarQueueService.add).toHaveBeenCalledWith(
        CalendarEventListFetchJob.name,
        {
          workspaceId: 'workspace-id',
          calendarChannelId: 'existing-calendar-channel-id',
        },
      );
    });

    it('should leave channels in PENDING_CONFIGURATION untouched', async () => {
      const existingAccount = {
        id: 'existing-account-id',
        handle: 'test@example.com',
        userWorkspaceId: 'user-workspace-id',
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
      } as ConnectedAccountEntity;

      const existingMessageChannel = {
        id: 'existing-message-channel-id',
        connectedAccountId: 'existing-account-id',
        syncStage: MessageChannelSyncStage.PENDING_CONFIGURATION,
      } as MessageChannelEntity;

      mockConnectedAccountRepository.findOne.mockResolvedValue(existingAccount);
      mockMessageChannelRepository.findOne.mockResolvedValue(
        existingMessageChannel,
      );
      mockCalendarChannelRepository.findOne.mockResolvedValue(null);
      mockWorkspaceMemberRepository.findOne.mockResolvedValue({
        id: 'workspace-member-id',
        userId: 'user-id',
      });
      mockUserWorkspaceRepository.findOne.mockResolvedValue({
        id: 'user-workspace-id',
      });

      await service.processAccount({
        ...baseInput,
        connectedAccountId: 'existing-account-id',
      });

      expect(
        mockMessagingChannelSyncStatusService.resetAndMarkAsMessagesListFetchPending,
      ).not.toHaveBeenCalled();
      expect(mockMessageQueueService.add).not.toHaveBeenCalled();
    });

    it('should not run reconnect logic when creating a brand new account', async () => {
      mockConnectedAccountRepository.findOne.mockResolvedValue(null);
      mockMessageChannelRepository.findOne.mockResolvedValue(null);
      mockCalendarChannelRepository.findOne.mockResolvedValue(null);
      mockWorkspaceMemberRepository.findOne.mockResolvedValue({
        id: 'workspace-member-id',
        userId: 'user-id',
      });
      mockUserWorkspaceRepository.findOne.mockResolvedValue({
        id: 'user-workspace-id',
      });

      await service.processAccount(baseInput);

      expect(
        mockAccountsToReconnectService.removeAccountToReconnect,
      ).not.toHaveBeenCalled();
      expect(
        mockMessagingChannelSyncStatusService.resetAndMarkAsMessagesListFetchPending,
      ).not.toHaveBeenCalled();
      expect(
        mockCalendarChannelSyncStatusService.resetAndMarkAsCalendarEventListFetchPending,
      ).not.toHaveBeenCalled();
      expect(mockMessageQueueService.add).not.toHaveBeenCalled();
      expect(mockCalendarQueueService.add).not.toHaveBeenCalled();
    });

    it('should only create message channel when only IMAP is configured', async () => {
      const imapOnlyInput = {
        ...baseInput,
        connectionParameters: {
          IMAP: {
            host: 'imap.example.com',
            port: 993,
            secure: true,
            password: 'password',
          },
        } as EmailAccountConnectionParameters,
      };

      mockConnectedAccountRepository.findOne.mockResolvedValue(null);
      mockMessageChannelRepository.findOne.mockResolvedValue(null);
      mockCalendarChannelRepository.findOne.mockResolvedValue(null);
      mockWorkspaceMemberRepository.findOne.mockResolvedValue({
        id: 'workspace-member-id',
        userId: 'user-id',
      });
      mockUserWorkspaceRepository.findOne.mockResolvedValue({
        id: 'user-workspace-id',
      });

      await service.processAccount(imapOnlyInput);

      expect(
        mockCreateMessageChannelService.createMessageChannel,
      ).toHaveBeenCalled();
      expect(
        mockCreateCalendarChannelService.createCalendarChannel,
      ).not.toHaveBeenCalled();
    });

    it('should only create calendar channel when only CALDAV is configured', async () => {
      const caldavOnlyInput = {
        ...baseInput,
        connectionParameters: {
          CALDAV: {
            host: 'caldav.example.com',
            port: 443,
            secure: true,
            username: 'test@example.com',
            password: 'password',
          },
        } as EmailAccountConnectionParameters,
      };

      mockConnectedAccountRepository.findOne.mockResolvedValue(null);
      mockMessageChannelRepository.findOne.mockResolvedValue(null);
      mockCalendarChannelRepository.findOne.mockResolvedValue(null);
      mockWorkspaceMemberRepository.findOne.mockResolvedValue({
        id: 'workspace-member-id',
        userId: 'user-id',
      });
      mockUserWorkspaceRepository.findOne.mockResolvedValue({
        id: 'user-workspace-id',
      });

      await service.processAccount(caldavOnlyInput);

      expect(
        mockCreateMessageChannelService.createMessageChannel,
      ).not.toHaveBeenCalled();
      expect(
        mockCreateCalendarChannelService.createCalendarChannel,
      ).toHaveBeenCalled();
    });

    it('should handle IMAP + SMTP configuration without CALDAV', async () => {
      const imapSmtpInput = {
        ...baseInput,
        connectionParameters: {
          IMAP: {
            host: 'imap.example.com',
            port: 993,
            secure: true,
            password: 'password',
          },
          SMTP: {
            host: 'smtp.example.com',
            port: 587,
            secure: true,
            username: 'test@example.com',
            password: 'password',
          },
        } as EmailAccountConnectionParameters,
      };

      mockConnectedAccountRepository.findOne.mockResolvedValue(null);
      mockMessageChannelRepository.findOne.mockResolvedValue(null);
      mockCalendarChannelRepository.findOne.mockResolvedValue(null);
      mockWorkspaceMemberRepository.findOne.mockResolvedValue({
        id: 'workspace-member-id',
        userId: 'user-id',
      });
      mockUserWorkspaceRepository.findOne.mockResolvedValue({
        id: 'user-workspace-id',
      });

      await service.processAccount(imapSmtpInput);

      expect(
        mockCreateMessageChannelService.createMessageChannel,
      ).toHaveBeenCalled();
      expect(
        mockCreateCalendarChannelService.createCalendarChannel,
      ).not.toHaveBeenCalled();
    });

    it('should handle full IMAP + SMTP + CALDAV configuration', async () => {
      const fullConfigInput = {
        ...baseInput,
        connectionParameters: {
          IMAP: {
            host: 'imap.example.com',
            port: 993,
            secure: true,
            password: 'password',
          },
          SMTP: {
            host: 'smtp.example.com',
            port: 587,
            secure: true,
            username: 'test@example.com',
            password: 'password',
          },
          CALDAV: {
            host: 'caldav.example.com',
            port: 443,
            secure: true,
            username: 'test@example.com',
            password: 'password',
          },
        } as EmailAccountConnectionParameters,
      };

      mockConnectedAccountRepository.findOne.mockResolvedValue(null);
      mockMessageChannelRepository.findOne.mockResolvedValue(null);
      mockCalendarChannelRepository.findOne.mockResolvedValue(null);
      mockWorkspaceMemberRepository.findOne.mockResolvedValue({
        id: 'workspace-member-id',
        userId: 'user-id',
      });
      mockUserWorkspaceRepository.findOne.mockResolvedValue({
        id: 'user-workspace-id',
      });

      await service.processAccount(fullConfigInput);

      expect(
        mockCreateMessageChannelService.createMessageChannel,
      ).toHaveBeenCalled();
      expect(
        mockCreateCalendarChannelService.createCalendarChannel,
      ).toHaveBeenCalled();
    });

    it('should handle account found by handle when connectedAccountId is not provided', async () => {
      const existingAccount = {
        id: 'existing-account-id',
        handle: 'test@example.com',
        userWorkspaceId: 'user-workspace-id',
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
      } as ConnectedAccountEntity;

      mockConnectedAccountRepository.findOne.mockResolvedValueOnce(
        existingAccount,
      );

      mockMessageChannelRepository.findOne.mockResolvedValue(null);
      mockCalendarChannelRepository.findOne.mockResolvedValue(null);
      mockWorkspaceMemberRepository.findOne.mockResolvedValue({
        id: 'workspace-member-id',
        userId: 'user-id',
      });
      mockUserWorkspaceRepository.findOne.mockResolvedValue({
        id: 'user-workspace-id',
      });

      await service.processAccount(baseInput);

      expect(mockConnectedAccountRepository.findOne).toHaveBeenCalledWith({
        where: {
          handle: 'test@example.com',
          userWorkspaceId: 'user-workspace-id',
          workspaceId: 'workspace-id',
        },
      });

      expect(mockTransactionManagerSave).toHaveBeenCalledWith({
        id: 'existing-account-id',
        handle: 'test@example.com',
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        connectionParameters: baseInput.connectionParameters,
        userWorkspaceId: 'user-workspace-id',
        workspaceId: 'workspace-id',
        authFailedAt: null,
      });
    });

    it('should not create channels when neither IMAP nor CALDAV is configured', async () => {
      const smtpOnlyInput = {
        ...baseInput,
        connectionParameters: {
          SMTP: {
            host: 'smtp.example.com',
            port: 587,
            secure: true,
            username: 'test@example.com',
            password: 'password',
          },
        } as EmailAccountConnectionParameters,
      };

      mockConnectedAccountRepository.findOne.mockResolvedValue(null);
      mockMessageChannelRepository.findOne.mockResolvedValue(null);
      mockCalendarChannelRepository.findOne.mockResolvedValue(null);
      mockWorkspaceMemberRepository.findOne.mockResolvedValue({
        id: 'workspace-member-id',
        userId: 'user-id',
      });
      mockUserWorkspaceRepository.findOne.mockResolvedValue({
        id: 'user-workspace-id',
      });

      await service.processAccount(smtpOnlyInput);

      expect(
        mockCreateMessageChannelService.createMessageChannel,
      ).not.toHaveBeenCalled();
      expect(
        mockCreateCalendarChannelService.createCalendarChannel,
      ).not.toHaveBeenCalled();
    });

    it('should handle transaction correctly', async () => {
      mockConnectedAccountRepository.findOne.mockResolvedValue(null);
      mockMessageChannelRepository.findOne.mockResolvedValue(null);
      mockCalendarChannelRepository.findOne.mockResolvedValue(null);
      mockWorkspaceMemberRepository.findOne.mockResolvedValue({
        id: 'workspace-member-id',
        userId: 'user-id',
      });
      mockUserWorkspaceRepository.findOne.mockResolvedValue({
        id: 'user-workspace-id',
      });

      await service.processAccount(baseInput);

      expect(
        mockConnectedAccountRepository.manager.transaction,
      ).toHaveBeenCalledWith(expect.any(Function));
    });
  });
});
