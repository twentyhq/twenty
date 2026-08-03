import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import {
  ConnectedAccountProvider,
  WebhookSubscriptionStatus,
} from 'twenty-shared/types';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { WEBHOOK_SUBSCRIPTION_RENEWAL_MAX_ATTEMPTS } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-renewal-max-attempts.constant';
import { CalendarWebhookSubscriptionService } from 'src/modules/connected-account/webhook-subscription-manager/services/calendar-webhook-subscription.service';
import { WebhookSubscriptionDriverFactory } from 'src/modules/connected-account/webhook-subscription-manager/services/webhook-subscription-driver-factory.service';

const WORKSPACE_ID = 'workspace-id';
const CHANNEL_ID = 'calendar-channel-id';

const buildChannel = (overrides = {}) => ({
  id: CHANNEL_ID,
  workspaceId: WORKSPACE_ID,
  connectedAccountId: 'connected-account-id',
  connectedAccount: { provider: ConnectedAccountProvider.GOOGLE },
  webhookSubscriptionStatus: WebhookSubscriptionStatus.FAILED,
  webhookSubscriptionFailureCount: 0,
  webhookSubscriptionClientState: 'client-state',
  webhookSubscriptionExternalId: null,
  webhookSubscriptionExternalResourceId: null,
  ...overrides,
});

describe('CalendarWebhookSubscriptionService bounded retry', () => {
  let service: CalendarWebhookSubscriptionService;
  let calendarChannelRepository: { findOne: jest.Mock; update: jest.Mock };
  let driver: {
    createSubscription: jest.Mock;
    renewSubscription: jest.Mock;
    deleteSubscription: jest.Mock;
  };
  let exceptionHandlerService: { captureExceptions: jest.Mock };

  beforeEach(async () => {
    calendarChannelRepository = { findOne: jest.fn(), update: jest.fn() };
    driver = {
      createSubscription: jest.fn(),
      renewSubscription: jest.fn(),
      deleteSubscription: jest.fn().mockResolvedValue(undefined),
    };
    exceptionHandlerService = { captureExceptions: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarWebhookSubscriptionService,
        {
          provide: getRepositoryToken(CalendarChannelEntity),
          useValue: calendarChannelRepository,
        },
        {
          provide: getRepositoryToken(ConnectedAccountEntity),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: WebhookSubscriptionDriverFactory,
          useValue: {
            isProviderSupported: () => true,
            getDriver: () => driver,
          },
        },
        {
          provide: ExceptionHandlerService,
          useValue: exceptionHandlerService,
        },
      ],
    }).compile();

    service = module.get(CalendarWebhookSubscriptionService);
  });

  afterEach(() => jest.clearAllMocks());

  it('increments the failure count without alerting while under the attempt budget', async () => {
    calendarChannelRepository.findOne.mockResolvedValue(
      buildChannel({ webhookSubscriptionFailureCount: 0 }),
    );
    driver.createSubscription.mockRejectedValue(new Error('boom'));

    await expect(
      service.createSubscription(CHANNEL_ID, WORKSPACE_ID),
    ).resolves.toBeUndefined();

    expect(calendarChannelRepository.update).toHaveBeenCalledWith(
      CHANNEL_ID,
      expect.objectContaining({
        webhookSubscriptionStatus: WebhookSubscriptionStatus.FAILED,
        webhookSubscriptionFailureCount: 1,
      }),
    );
    expect(exceptionHandlerService.captureExceptions).not.toHaveBeenCalled();
  });

  it('alerts once when the failure count reaches the attempt budget', async () => {
    calendarChannelRepository.findOne.mockResolvedValue(
      buildChannel({
        webhookSubscriptionFailureCount:
          WEBHOOK_SUBSCRIPTION_RENEWAL_MAX_ATTEMPTS - 1,
      }),
    );
    driver.createSubscription.mockRejectedValue(new Error('boom'));

    await service.createSubscription(CHANNEL_ID, WORKSPACE_ID);

    expect(calendarChannelRepository.update).toHaveBeenCalledWith(
      CHANNEL_ID,
      expect.objectContaining({
        webhookSubscriptionFailureCount:
          WEBHOOK_SUBSCRIPTION_RENEWAL_MAX_ATTEMPTS,
      }),
    );
    expect(exceptionHandlerService.captureExceptions).toHaveBeenCalledTimes(1);
  });

  it('still retries an explicit re-subscription past the attempt budget so reconnects are not locked out', async () => {
    calendarChannelRepository.findOne.mockResolvedValue(
      buildChannel({
        webhookSubscriptionFailureCount:
          WEBHOOK_SUBSCRIPTION_RENEWAL_MAX_ATTEMPTS,
      }),
    );
    driver.createSubscription.mockResolvedValue({
      externalSubscriptionId: 'external-id',
      externalResourceId: 'resource-id',
      expiresAt: new Date(),
    });

    await service.createSubscription(CHANNEL_ID, WORKSPACE_ID);

    expect(driver.createSubscription).toHaveBeenCalled();
    expect(calendarChannelRepository.update).toHaveBeenCalledWith(
      CHANNEL_ID,
      expect.objectContaining({
        webhookSubscriptionStatus: WebhookSubscriptionStatus.ACTIVE,
        webhookSubscriptionFailureCount: 0,
      }),
    );
  });

  it('resets the failure count on a successful subscription', async () => {
    calendarChannelRepository.findOne.mockResolvedValue(
      buildChannel({ webhookSubscriptionFailureCount: 3 }),
    );
    driver.createSubscription.mockResolvedValue({
      externalSubscriptionId: 'external-id',
      externalResourceId: 'resource-id',
      expiresAt: new Date(),
    });

    await service.createSubscription(CHANNEL_ID, WORKSPACE_ID);

    expect(calendarChannelRepository.update).toHaveBeenCalledWith(
      CHANNEL_ID,
      expect.objectContaining({
        webhookSubscriptionStatus: WebhookSubscriptionStatus.ACTIVE,
        webhookSubscriptionFailureCount: 0,
      }),
    );
  });
});
