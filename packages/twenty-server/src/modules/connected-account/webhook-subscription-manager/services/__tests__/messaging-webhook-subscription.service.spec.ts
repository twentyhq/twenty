import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import {
  ConnectedAccountProvider,
  WebhookSubscriptionStatus,
} from 'twenty-shared/types';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WEBHOOK_SUBSCRIPTION_RENEWAL_MAX_ATTEMPTS } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-renewal-max-attempts.constant';
import { MessagingWebhookSubscriptionService } from 'src/modules/connected-account/webhook-subscription-manager/services/messaging-webhook-subscription.service';
import { WebhookSubscriptionDriverFactory } from 'src/modules/connected-account/webhook-subscription-manager/services/webhook-subscription-driver-factory.service';

const WORKSPACE_ID = 'workspace-id';
const CHANNEL_ID = 'message-channel-id';

const buildChannel = (overrides = {}) => ({
  id: CHANNEL_ID,
  workspaceId: WORKSPACE_ID,
  connectedAccountId: 'connected-account-id',
  connectedAccount: { provider: ConnectedAccountProvider.GOOGLE },
  webhookSubscriptionStatus: WebhookSubscriptionStatus.FAILED,
  webhookSubscriptionFailureCount: 0,
  webhookSubscriptionClientState: 'client-state',
  webhookSubscriptionExternalId: null,
  ...overrides,
});

describe('MessagingWebhookSubscriptionService bounded retry', () => {
  let service: MessagingWebhookSubscriptionService;
  let messageChannelRepository: { findOne: jest.Mock; update: jest.Mock };
  let driver: {
    createSubscription: jest.Mock;
    renewSubscription: jest.Mock;
    deleteSubscription: jest.Mock;
  };
  let exceptionHandlerService: { captureExceptions: jest.Mock };

  beforeEach(async () => {
    messageChannelRepository = { findOne: jest.fn(), update: jest.fn() };
    driver = {
      createSubscription: jest.fn(),
      renewSubscription: jest.fn(),
      deleteSubscription: jest.fn().mockResolvedValue(undefined),
    };
    exceptionHandlerService = { captureExceptions: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagingWebhookSubscriptionService,
        {
          provide: getRepositoryToken(MessageChannelEntity),
          useValue: messageChannelRepository,
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

    service = module.get(MessagingWebhookSubscriptionService);
  });

  afterEach(() => jest.clearAllMocks());

  it('increments the failure count without alerting while under the attempt budget', async () => {
    messageChannelRepository.findOne.mockResolvedValue(
      buildChannel({ webhookSubscriptionFailureCount: 0 }),
    );
    driver.createSubscription.mockRejectedValue(new Error('boom'));

    await expect(
      service.createSubscription(CHANNEL_ID, WORKSPACE_ID),
    ).resolves.toBeUndefined();

    expect(messageChannelRepository.update).toHaveBeenCalledWith(
      CHANNEL_ID,
      expect.objectContaining({
        webhookSubscriptionStatus: WebhookSubscriptionStatus.FAILED,
        webhookSubscriptionFailureCount: 1,
      }),
    );
    expect(exceptionHandlerService.captureExceptions).not.toHaveBeenCalled();
  });

  it('alerts once when the failure count reaches the attempt budget', async () => {
    messageChannelRepository.findOne.mockResolvedValue(
      buildChannel({
        webhookSubscriptionFailureCount:
          WEBHOOK_SUBSCRIPTION_RENEWAL_MAX_ATTEMPTS - 1,
      }),
    );
    driver.createSubscription.mockRejectedValue(new Error('boom'));

    await service.createSubscription(CHANNEL_ID, WORKSPACE_ID);

    expect(messageChannelRepository.update).toHaveBeenCalledWith(
      CHANNEL_ID,
      expect.objectContaining({
        webhookSubscriptionFailureCount:
          WEBHOOK_SUBSCRIPTION_RENEWAL_MAX_ATTEMPTS,
      }),
    );
    expect(exceptionHandlerService.captureExceptions).toHaveBeenCalledTimes(1);
  });

  it('still retries an explicit re-subscription past the attempt budget so reconnects are not locked out', async () => {
    messageChannelRepository.findOne.mockResolvedValue(
      buildChannel({
        webhookSubscriptionFailureCount:
          WEBHOOK_SUBSCRIPTION_RENEWAL_MAX_ATTEMPTS,
      }),
    );
    driver.createSubscription.mockResolvedValue({
      externalSubscriptionId: 'external-id',
      externalResourceId: null,
      expiresAt: new Date(),
    });

    await service.createSubscription(CHANNEL_ID, WORKSPACE_ID);

    expect(driver.createSubscription).toHaveBeenCalled();
    expect(messageChannelRepository.update).toHaveBeenCalledWith(
      CHANNEL_ID,
      expect.objectContaining({
        webhookSubscriptionStatus: WebhookSubscriptionStatus.ACTIVE,
        webhookSubscriptionFailureCount: 0,
      }),
    );
  });

  it('resets the failure count on a successful subscription', async () => {
    messageChannelRepository.findOne.mockResolvedValue(
      buildChannel({ webhookSubscriptionFailureCount: 3 }),
    );
    driver.createSubscription.mockResolvedValue({
      externalSubscriptionId: 'external-id',
      externalResourceId: null,
      expiresAt: new Date(),
    });

    await service.createSubscription(CHANNEL_ID, WORKSPACE_ID);

    expect(messageChannelRepository.update).toHaveBeenCalledWith(
      CHANNEL_ID,
      expect.objectContaining({
        webhookSubscriptionStatus: WebhookSubscriptionStatus.ACTIVE,
        webhookSubscriptionFailureCount: 0,
      }),
    );
  });
});
