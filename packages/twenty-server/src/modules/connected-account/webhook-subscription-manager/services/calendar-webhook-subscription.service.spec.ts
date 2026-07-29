import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import {
  ConnectedAccountProvider,
  WebhookSubscriptionChannelType,
  WebhookSubscriptionStatus,
} from 'twenty-shared/types';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';
import {
  WebhookSubscriptionDriverException,
  WebhookSubscriptionDriverExceptionCode,
} from 'src/modules/connected-account/webhook-subscription-manager/drivers/exceptions/webhook-subscription-driver.exception';
import { CalendarWebhookSubscriptionService } from 'src/modules/connected-account/webhook-subscription-manager/services/calendar-webhook-subscription.service';
import { WebhookSubscriptionDriverFactory } from 'src/modules/connected-account/webhook-subscription-manager/services/webhook-subscription-driver-factory.service';

describe('CalendarWebhookSubscriptionService', () => {
  let service: CalendarWebhookSubscriptionService;
  let calendarChannelRepository: { findOne: jest.Mock; update: jest.Mock };
  let exceptionHandlerService: { captureExceptions: jest.Mock };
  let accountsToReconnectService: { markAccountForReconnect: jest.Mock };
  let driver: {
    createSubscription: jest.Mock;
    renewSubscription: jest.Mock;
    deleteSubscription: jest.Mock;
  };

  const mockWorkspaceId = 'workspace-id';
  const mockCalendarChannelId = 'calendar-channel-id';

  const mockCalendarChannel = {
    id: mockCalendarChannelId,
    workspaceId: mockWorkspaceId,
    connectedAccountId: 'connected-account-id',
    connectedAccount: {
      id: 'connected-account-id',
      provider: ConnectedAccountProvider.GOOGLE,
    },
    webhookSubscriptionStatus: WebhookSubscriptionStatus.FAILED,
    webhookSubscriptionExternalId: null,
    webhookSubscriptionExternalResourceId: null,
    webhookSubscriptionClientState: 'client-state',
  };

  beforeEach(async () => {
    calendarChannelRepository = {
      findOne: jest.fn(),
      update: jest.fn(),
    };
    exceptionHandlerService = {
      captureExceptions: jest.fn(),
    };
    accountsToReconnectService = {
      markAccountForReconnect: jest.fn(),
    };
    driver = {
      createSubscription: jest.fn(),
      renewSubscription: jest.fn(),
      deleteSubscription: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarWebhookSubscriptionService,
        {
          provide: getRepositoryToken(ConnectedAccountEntity),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(CalendarChannelEntity),
          useValue: calendarChannelRepository,
        },
        {
          provide: WebhookSubscriptionDriverFactory,
          useValue: {
            isProviderSupported: jest.fn().mockReturnValue(true),
            getDriver: jest.fn().mockReturnValue(driver),
          },
        },
        {
          provide: ExceptionHandlerService,
          useValue: exceptionHandlerService,
        },
        {
          provide: AccountsToReconnectService,
          useValue: accountsToReconnectService,
        },
      ],
    }).compile();

    service = module.get(CalendarWebhookSubscriptionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSubscription', () => {
    it('should mark the channel as failed without capturing when the refresh token is invalid', async () => {
      calendarChannelRepository.findOne.mockResolvedValue(mockCalendarChannel);
      driver.createSubscription.mockRejectedValue(
        new ConnectedAccountRefreshAccessTokenException(
          'Invalid Refresh Token: Bad Request',
          ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
        ),
      );

      await expect(
        service.createSubscription(mockCalendarChannelId, mockWorkspaceId),
      ).resolves.toBeUndefined();

      expect(calendarChannelRepository.update).toHaveBeenCalledWith(
        mockCalendarChannelId,
        expect.objectContaining({
          webhookSubscriptionStatus: WebhookSubscriptionStatus.FAILED,
        }),
      );
      expect(
        accountsToReconnectService.markAccountForReconnect,
      ).toHaveBeenCalledWith('connected-account-id', mockWorkspaceId);
      expect(exceptionHandlerService.captureExceptions).not.toHaveBeenCalled();
    });

    it('should mark the channel as failed without capturing when the subscription is forbidden', async () => {
      calendarChannelRepository.findOne.mockResolvedValue(mockCalendarChannel);
      driver.createSubscription.mockRejectedValue(
        new WebhookSubscriptionDriverException(
          'The user must be signed up for Google Calendar.',
          WebhookSubscriptionDriverExceptionCode.SUBSCRIPTION_FORBIDDEN,
        ),
      );

      await expect(
        service.createSubscription(mockCalendarChannelId, mockWorkspaceId),
      ).resolves.toBeUndefined();

      expect(calendarChannelRepository.update).toHaveBeenCalledWith(
        mockCalendarChannelId,
        expect.objectContaining({
          webhookSubscriptionStatus: WebhookSubscriptionStatus.FAILED,
        }),
      );
      expect(exceptionHandlerService.captureExceptions).not.toHaveBeenCalled();
    });

    it('should capture and rethrow unknown errors', async () => {
      const unknownError = new Error('boom');

      calendarChannelRepository.findOne.mockResolvedValue(mockCalendarChannel);
      driver.createSubscription.mockRejectedValue(unknownError);

      await expect(
        service.createSubscription(mockCalendarChannelId, mockWorkspaceId),
      ).rejects.toThrow(unknownError);

      expect(exceptionHandlerService.captureExceptions).toHaveBeenCalledWith(
        [unknownError],
        { workspace: { id: mockWorkspaceId } },
      );
      expect(
        accountsToReconnectService.markAccountForReconnect,
      ).not.toHaveBeenCalled();
    });
  });

  describe('renewSubscription', () => {
    const mockActiveCalendarChannel = {
      ...mockCalendarChannel,
      webhookSubscriptionStatus: WebhookSubscriptionStatus.ACTIVE,
      webhookSubscriptionExternalId: 'external-id',
      webhookSubscriptionExternalResourceId: 'resource-id',
    };

    it('should mark the channel as failed without capturing when the refresh token is missing', async () => {
      calendarChannelRepository.findOne.mockResolvedValue(
        mockActiveCalendarChannel,
      );
      driver.renewSubscription.mockRejectedValue(
        new ConnectedAccountRefreshAccessTokenException(
          'No refresh token found',
          ConnectedAccountRefreshAccessTokenExceptionCode.REFRESH_TOKEN_NOT_FOUND,
        ),
      );

      await expect(
        service.renewSubscription({
          calendarChannelId: mockCalendarChannelId,
          workspaceId: mockWorkspaceId,
        }),
      ).resolves.toBeUndefined();

      expect(calendarChannelRepository.update).toHaveBeenCalledWith(
        mockCalendarChannelId,
        { webhookSubscriptionStatus: WebhookSubscriptionStatus.FAILED },
      );
      expect(
        accountsToReconnectService.markAccountForReconnect,
      ).toHaveBeenCalledWith('connected-account-id', mockWorkspaceId);
      expect(exceptionHandlerService.captureExceptions).not.toHaveBeenCalled();
    });

    it('should capture and rethrow unknown errors', async () => {
      const unknownError = new Error('boom');

      calendarChannelRepository.findOne.mockResolvedValue(
        mockActiveCalendarChannel,
      );
      driver.renewSubscription.mockRejectedValue(unknownError);

      await expect(
        service.renewSubscription({
          calendarChannelId: mockCalendarChannelId,
          workspaceId: mockWorkspaceId,
        }),
      ).rejects.toThrow(unknownError);

      expect(exceptionHandlerService.captureExceptions).toHaveBeenCalledWith(
        [unknownError],
        { workspace: { id: mockWorkspaceId } },
      );
    });

    it('should renew and store the new subscription on success', async () => {
      const expiresAt = new Date('2026-08-01T00:00:00.000Z');

      calendarChannelRepository.findOne.mockResolvedValue(
        mockActiveCalendarChannel,
      );
      driver.renewSubscription.mockResolvedValue({
        externalSubscriptionId: 'new-external-id',
        externalResourceId: 'new-resource-id',
        expiresAt,
      });

      await service.renewSubscription({
        calendarChannelId: mockCalendarChannelId,
        workspaceId: mockWorkspaceId,
      });

      expect(driver.renewSubscription).toHaveBeenCalledWith({
        connectedAccountId: 'connected-account-id',
        channelType: WebhookSubscriptionChannelType.CALENDAR,
        externalSubscriptionId: 'external-id',
        externalResourceId: 'resource-id',
        clientState: 'client-state',
      });
      expect(calendarChannelRepository.update).toHaveBeenCalledWith(
        mockCalendarChannelId,
        {
          webhookSubscriptionExternalId: 'new-external-id',
          webhookSubscriptionExternalResourceId: 'new-resource-id',
          webhookSubscriptionStatus: WebhookSubscriptionStatus.ACTIVE,
          webhookSubscriptionExpiresAt: expiresAt,
        },
      );
      expect(exceptionHandlerService.captureExceptions).not.toHaveBeenCalled();
    });
  });
});
