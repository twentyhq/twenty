import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import {
  ConnectedAccountProvider,
  WebhookSubscriptionStatus,
} from 'twenty-shared/types';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';
import { ConnectedAccountAuthFailureService } from 'src/modules/connected-account/services/connected-account-auth-failure.service';
import { CalendarWebhookSubscriptionService } from 'src/modules/connected-account/webhook-subscription-manager/services/calendar-webhook-subscription.service';
import { WebhookSubscriptionDriverFactory } from 'src/modules/connected-account/webhook-subscription-manager/services/webhook-subscription-driver-factory.service';

describe('CalendarWebhookSubscriptionService', () => {
  let service: CalendarWebhookSubscriptionService;
  let calendarChannelRepository: { findOne: jest.Mock; update: jest.Mock };
  let driver: { renewSubscription: jest.Mock; deleteSubscription: jest.Mock };
  let exceptionHandlerService: { captureExceptions: jest.Mock };
  let connectedAccountAuthFailureService: { markAuthFailed: jest.Mock };

  const workspaceId = 'workspace-1';
  const calendarChannelId = 'calendar-channel-1';
  const connectedAccountId = 'connected-account-1';

  const activeCalendarChannel = {
    id: calendarChannelId,
    workspaceId,
    connectedAccountId,
    webhookSubscriptionStatus: WebhookSubscriptionStatus.ACTIVE,
    webhookSubscriptionExternalId: 'external-1',
    webhookSubscriptionExternalResourceId: null,
    webhookSubscriptionClientState: 'client-state-1',
    connectedAccount: {
      id: connectedAccountId,
      provider: ConnectedAccountProvider.MICROSOFT,
    },
  } as unknown as CalendarChannelEntity;

  beforeEach(async () => {
    calendarChannelRepository = {
      findOne: jest.fn().mockResolvedValue(activeCalendarChannel),
      update: jest.fn().mockResolvedValue(undefined),
    };

    driver = {
      renewSubscription: jest.fn(),
      deleteSubscription: jest.fn().mockResolvedValue(undefined),
    };

    exceptionHandlerService = { captureExceptions: jest.fn() };
    connectedAccountAuthFailureService = {
      markAuthFailed: jest.fn().mockResolvedValue(undefined),
    };

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
            getDriver: jest.fn().mockReturnValue(driver),
            isProviderSupported: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: ExceptionHandlerService,
          useValue: exceptionHandlerService,
        },
        {
          provide: ConnectedAccountAuthFailureService,
          useValue: connectedAccountAuthFailureService,
        },
      ],
    }).compile();

    service = module.get(CalendarWebhookSubscriptionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should flag the account for reconnection and stop retrying when the refresh token is invalid', async () => {
    driver.renewSubscription.mockRejectedValue(
      new ConnectedAccountRefreshAccessTokenException(
        'Microsoft token refresh requires re-authentication: invalid_grant',
        ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
      ),
    );

    await expect(
      service.renewSubscription({ calendarChannelId, workspaceId }),
    ).resolves.toBeUndefined();

    expect(calendarChannelRepository.update).toHaveBeenCalledWith(
      calendarChannelId,
      { webhookSubscriptionStatus: WebhookSubscriptionStatus.FAILED },
    );
    expect(
      connectedAccountAuthFailureService.markAuthFailed,
    ).toHaveBeenCalledWith({ connectedAccountId, workspaceId });
    expect(exceptionHandlerService.captureExceptions).not.toHaveBeenCalled();
  });

  it('should capture and rethrow when the failure is not an authentication failure', async () => {
    const error = new Error('Microsoft Graph is unavailable');

    driver.renewSubscription.mockRejectedValue(error);

    await expect(
      service.renewSubscription({ calendarChannelId, workspaceId }),
    ).rejects.toThrow(error);

    expect(
      connectedAccountAuthFailureService.markAuthFailed,
    ).not.toHaveBeenCalled();
    expect(exceptionHandlerService.captureExceptions).toHaveBeenCalledWith(
      [error],
      {
        workspace: { id: workspaceId },
        additionalData: { connectedAccountId, calendarChannelId },
      },
    );
  });
});
