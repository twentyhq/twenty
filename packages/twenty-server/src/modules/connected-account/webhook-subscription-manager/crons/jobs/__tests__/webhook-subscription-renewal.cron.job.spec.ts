import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { WebhookSubscriptionStatus } from 'twenty-shared/types';
import { LessThan } from 'typeorm';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WEBHOOK_SUBSCRIPTION_RENEWAL_MAX_ATTEMPTS } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-renewal-max-attempts.constant';
import { WebhookSubscriptionRenewalCronJob } from 'src/modules/connected-account/webhook-subscription-manager/crons/jobs/webhook-subscription-renewal.cron.job';

describe('WebhookSubscriptionRenewalCronJob', () => {
  let cronJob: WebhookSubscriptionRenewalCronJob;
  let messageChannelRepository: { find: jest.Mock };
  let calendarChannelRepository: { find: jest.Mock };

  beforeEach(async () => {
    messageChannelRepository = { find: jest.fn().mockResolvedValue([]) };
    calendarChannelRepository = { find: jest.fn().mockResolvedValue([]) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookSubscriptionRenewalCronJob,
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: {
            find: jest.fn().mockResolvedValue([{ id: 'workspace-id' }]),
          },
        },
        {
          provide: getRepositoryToken(MessageChannelEntity),
          useValue: messageChannelRepository,
        },
        {
          provide: getRepositoryToken(CalendarChannelEntity),
          useValue: calendarChannelRepository,
        },
        {
          provide: getQueueToken(MessageQueue.webhookQueue),
          useValue: { add: jest.fn() },
        },
      ],
    }).compile();

    cronJob = module.get(WebhookSubscriptionRenewalCronJob);
  });

  afterEach(() => jest.clearAllMocks());

  it('only reselects FAILED channels whose failure count is under the attempt budget', async () => {
    await cronJob.handle();

    for (const repository of [
      messageChannelRepository,
      calendarChannelRepository,
    ]) {
      const { where } = repository.find.mock.calls[0][0];
      const failedBranch = where.find(
        (clause: { webhookSubscriptionStatus: WebhookSubscriptionStatus }) =>
          clause.webhookSubscriptionStatus === WebhookSubscriptionStatus.FAILED,
      );

      expect(failedBranch.webhookSubscriptionFailureCount).toEqual(
        LessThan(WEBHOOK_SUBSCRIPTION_RENEWAL_MAX_ATTEMPTS),
      );
    }
  });
});
