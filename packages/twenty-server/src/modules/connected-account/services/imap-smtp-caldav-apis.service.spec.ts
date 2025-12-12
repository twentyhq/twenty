import { Test, type TestingModule } from '@nestjs/testing';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { CreateCalendarChannelService } from 'src/engine/core-modules/auth/services/create-calendar-channel.service';
import { CreateMessageChannelService } from 'src/engine/core-modules/auth/services/create-message-channel.service';
import { type EmailAccountConnectionParameters } from 'src/engine/core-modules/imap-smtp-caldav-connection/dtos/imap-smtp-caldav-connection.dto';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { ImapSmtpCalDavAPIService } from 'src/modules/connected-account/services/imap-smtp-caldav-apis.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

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

  const mockCreateMessageChannelService = {
    createMessageChannel: jest.fn().mockResolvedValue('mocked-uuid'),
  };

  const mockCreateCalendarChannelService = {
    createCalendarChannel: jest.fn().mockResolvedValue('mocked-uuid'),
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
                if (entity === 'connectedAccount')
                  return mockConnectedAccountRepository;
                if (entity === 'messageChannel')
                  return mockMessageChannelRepository;
                if (entity === 'calendarChannel')
                  return mockCalendarChannelRepository;

                return {};
              }),
            getGlobalWorkspaceDataSource: jest
              .fn()
              .mockResolvedValue(mockWorkspaceDataSource),
            executeInWorkspaceContext: jest
              .fn()

              .mockImplementation((_authContext: any, fn: () => any) => fn()),
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
        {},
      );

      expect(
        mockCreateMessageChannelService.createMessageChannel,
      ).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        connectedAccountId: 'mocked-uuid',
        handle: 'test@example.com',
        manager: {},
      });

      expect(
        mockCreateCalendarChannelService.createCalendarChannel,
      ).not.toHaveBeenCalled();
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
        {},
      );

      expect(
        mockCreateMessageChannelService.createMessageChannel,
      ).not.toHaveBeenCalled();
      expect(
        mockCreateCalendarChannelService.createCalendarChannel,
      ).not.toHaveBeenCalled();
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
        {},
      );
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

      await service.processAccount(baseInput);

      expect(mockWorkspaceDataSource.transaction).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });
  });
});
