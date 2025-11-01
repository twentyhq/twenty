import { Test, type TestingModule } from '@nestjs/testing';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { type EmailAccountConnectionParameters } from 'src/engine/core-modules/imap-smtp-caldav-connection/dtos/imap-smtp-caldav-connection.dto';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { type CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { ImapSmtpCalDavAPIService } from 'src/modules/connected-account/services/imap-smtp-caldav-apis.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageChannelType,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

describe('ImapSmtpCalDavAPIService', () => {
  let service: ImapSmtpCalDavAPIService;

  const mockConnectedAccountRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockMessageChannelRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockCalendarChannelRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockWorkspaceDataSource = {
    transaction: jest.fn((callback) => callback({})),
  };

  const mockMessageQueueService = {
    add: jest.fn(),
  };

  const mockCalendarQueueService = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImapSmtpCalDavAPIService,
        {
          provide: TwentyORMGlobalManager,
          useValue: {
            getRepositoryForWorkspace: jest
              .fn()
              .mockImplementation((_workspaceId, entity) => {
                if (entity === 'connectedAccount')
                  return mockConnectedAccountRepository;
                if (entity === 'messageChannel')
                  return mockMessageChannelRepository;
                if (entity === 'calendarChannel')
                  return mockCalendarChannelRepository;

                return {};
              }),
            getDataSourceForWorkspace: jest
              .fn()
              .mockImplementation(() => mockWorkspaceDataSource),
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

    it('should create new account with message and calendar channels when account does not exist', async () => {
      mockConnectedAccountRepository.findOne.mockResolvedValue(null);
      mockMessageChannelRepository.findOne.mockResolvedValue(null);
      mockCalendarChannelRepository.findOne.mockResolvedValue(null);

      const expectedMessageChannel = {
        id: 'mocked-uuid',
        connectedAccountId: 'mocked-uuid',
        type: MessageChannelType.EMAIL,
        handle: 'test@example.com',
        isSyncEnabled: true,
        syncStatus: MessageChannelSyncStatus.NOT_SYNCED,
        syncStage: MessageChannelSyncStage.PENDING_CONFIGURATION,
        syncCursor: '',
        syncStageStartedAt: null,
      };

      mockMessageChannelRepository.save.mockResolvedValue(
        expectedMessageChannel,
      );

      await service.processAccount(baseInput);

      expect(mockConnectedAccountRepository.save).toHaveBeenCalledWith(
        {
          id: 'mocked-uuid',
          handle: 'test@example.com',
          provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
          connectionParameters: baseInput.connectionParameters,
          accountOwnerId: 'workspace-member-id',
        },
        {},
      );

      expect(mockMessageChannelRepository.save).toHaveBeenCalledWith(
        {
          id: 'mocked-uuid',
          connectedAccountId: 'mocked-uuid',
          type: MessageChannelType.EMAIL,
          handle: 'test@example.com',
          isSyncEnabled: true,
          syncStatus: MessageChannelSyncStatus.NOT_SYNCED,
          syncStage: MessageChannelSyncStage.PENDING_CONFIGURATION,
          syncCursor: '',
          syncStageStartedAt: null,
        },
        {},
      );

      expect(mockMessageQueueService.add).not.toHaveBeenCalled();
    });

    it('should preserve existing channels when updating account credentials', async () => {
      const existingAccount = {
        id: 'existing-account-id',
        handle: 'test@example.com',
        accountOwnerId: 'workspace-member-id',
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
      } as ConnectedAccountWorkspaceEntity;

      const existingMessageChannel = {
        id: 'existing-message-channel-id',
        connectedAccountId: 'existing-account-id',
        type: MessageChannelType.EMAIL,
        handle: 'test@example.com',
        isSyncEnabled: true,
        syncStatus: MessageChannelSyncStatus.ONGOING,
      } as MessageChannelWorkspaceEntity;

      const existingCalendarChannel = {
        id: 'existing-calendar-channel-id',
        connectedAccountId: 'existing-account-id',
      } as CalendarChannelWorkspaceEntity;

      mockConnectedAccountRepository.findOne.mockResolvedValue(existingAccount);
      mockMessageChannelRepository.findOne.mockResolvedValue(
        existingMessageChannel,
      );
      mockCalendarChannelRepository.findOne.mockResolvedValue(
        existingCalendarChannel,
      );

      const inputWithConnectedAccountId = {
        ...baseInput,
        connectedAccountId: 'existing-account-id',
      };

      await service.processAccount(inputWithConnectedAccountId);

      expect(mockConnectedAccountRepository.save).toHaveBeenCalledWith(
        {
          id: 'existing-account-id',
          handle: 'test@example.com',
          provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
          connectionParameters: baseInput.connectionParameters,
          accountOwnerId: 'workspace-member-id',
        },
        {},
      );

      expect(mockMessageChannelRepository.save).not.toHaveBeenCalled();
      expect(mockCalendarChannelRepository.save).not.toHaveBeenCalled();

      expect(mockMessageQueueService.add).not.toHaveBeenCalled();
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

      const expectedMessageChannel = {
        id: 'mocked-uuid',
        connectedAccountId: 'mocked-uuid',
        type: MessageChannelType.EMAIL,
        handle: 'test@example.com',
        isSyncEnabled: true,
        syncStatus: MessageChannelSyncStatus.NOT_SYNCED,
        syncStage: MessageChannelSyncStage.PENDING_CONFIGURATION,
      };

      mockMessageChannelRepository.save.mockResolvedValue(
        expectedMessageChannel,
      );

      await service.processAccount(imapOnlyInput);

      expect(mockMessageChannelRepository.save).toHaveBeenCalled();
      expect(mockCalendarChannelRepository.save).not.toHaveBeenCalled();
      expect(mockMessageQueueService.add).not.toHaveBeenCalled();

      expect(mockCalendarQueueService.add).not.toHaveBeenCalled();
    });

    it('should create both channels when only CALDAV is configured but disable message sync', async () => {
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

      const expectedCalendarChannel = {
        id: 'mocked-uuid',
        connectedAccountId: 'mocked-uuid',
        handle: 'test@example.com',
      };

      mockCalendarChannelRepository.save.mockResolvedValue(
        expectedCalendarChannel,
      );

      await service.processAccount(caldavOnlyInput);

      expect(mockMessageChannelRepository.save).toHaveBeenCalledWith(
        {
          id: 'mocked-uuid',
          connectedAccountId: 'mocked-uuid',
          type: MessageChannelType.EMAIL,
          handle: 'test@example.com',
          isSyncEnabled: false,
          syncStatus: MessageChannelSyncStatus.NOT_SYNCED,
          syncStage: MessageChannelSyncStage.PENDING_CONFIGURATION,
          syncCursor: '',
          syncStageStartedAt: null,
        },
        {},
      );
      expect(mockCalendarChannelRepository.save).toHaveBeenCalled();

      expect(mockMessageQueueService.add).not.toHaveBeenCalled();
      expect(mockCalendarQueueService.add).not.toHaveBeenCalled();
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

      const expectedMessageChannel = {
        id: 'mocked-uuid',
        connectedAccountId: 'mocked-uuid',
        type: MessageChannelType.EMAIL,
        handle: 'test@example.com',
        isSyncEnabled: true,
        syncStatus: MessageChannelSyncStatus.NOT_SYNCED,
        syncStage: MessageChannelSyncStage.PENDING_CONFIGURATION,
      };

      mockMessageChannelRepository.save.mockResolvedValue(
        expectedMessageChannel,
      );

      await service.processAccount(imapSmtpInput);

      expect(mockMessageChannelRepository.save).toHaveBeenCalled();
      expect(mockCalendarChannelRepository.save).not.toHaveBeenCalled();
      expect(mockMessageQueueService.add).not.toHaveBeenCalled();
      expect(mockCalendarQueueService.add).not.toHaveBeenCalled();
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

      const expectedMessageChannel = {
        id: 'mocked-uuid',
        connectedAccountId: 'mocked-uuid',
        type: MessageChannelType.EMAIL,
        handle: 'test@example.com',
        isSyncEnabled: true,
        syncStatus: MessageChannelSyncStatus.NOT_SYNCED,
        syncStage: MessageChannelSyncStage.PENDING_CONFIGURATION,
      };

      const expectedCalendarChannel = {
        id: 'mocked-uuid',
        connectedAccountId: 'mocked-uuid',
        handle: 'test@example.com',
      };

      mockMessageChannelRepository.save.mockResolvedValue(
        expectedMessageChannel,
      );
      mockCalendarChannelRepository.save.mockResolvedValue(
        expectedCalendarChannel,
      );

      await service.processAccount(fullConfigInput);

      expect(mockMessageChannelRepository.save).toHaveBeenCalled();
      expect(mockCalendarChannelRepository.save).toHaveBeenCalled();
      expect(mockMessageQueueService.add).not.toHaveBeenCalled();
      expect(mockCalendarQueueService.add).not.toHaveBeenCalled();
    });

    it('should handle account found by handle when connectedAccountId is not provided', async () => {
      const existingAccount = {
        id: 'existing-account-id',
        handle: 'test@example.com',
        accountOwnerId: 'workspace-member-id',
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
      } as ConnectedAccountWorkspaceEntity;

      mockConnectedAccountRepository.findOne.mockResolvedValueOnce(
        existingAccount,
      );

      mockMessageChannelRepository.findOne.mockResolvedValue(null);
      mockCalendarChannelRepository.findOne.mockResolvedValue(null);

      await service.processAccount(baseInput);

      expect(mockConnectedAccountRepository.findOne).toHaveBeenCalledWith({
        where: {
          handle: 'test@example.com',
          accountOwnerId: 'workspace-member-id',
        },
      });

      expect(mockConnectedAccountRepository.save).toHaveBeenCalledWith(
        {
          id: 'existing-account-id',
          handle: 'test@example.com',
          provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
          connectionParameters: baseInput.connectionParameters,
          accountOwnerId: 'workspace-member-id',
        },
        {},
      );
    });

    it('should not enqueue sync jobs when channels are disabled', async () => {
      const disabledInput = {
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

      await service.processAccount(disabledInput);

      expect(mockMessageQueueService.add).not.toHaveBeenCalled();
      expect(mockCalendarQueueService.add).not.toHaveBeenCalled();
    });

    it('should handle transaction correctly', async () => {
      mockConnectedAccountRepository.findOne.mockResolvedValue(null);
      mockMessageChannelRepository.findOne.mockResolvedValue(null);
      mockCalendarChannelRepository.findOne.mockResolvedValue(null);
      mockMessageChannelRepository.save.mockResolvedValue({
        id: 'mocked-uuid',
        connectedAccountId: 'mocked-uuid',
      });

      await service.processAccount(baseInput);

      expect(mockWorkspaceDataSource.transaction).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });
  });
});
