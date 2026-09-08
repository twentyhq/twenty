import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  WebhookSubscriptionChannelType,
  WebhookSubscriptionStatus,
} from 'twenty-shared/types';
import { In, Repository } from 'typeorm';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WEBHOOK_SUBSCRIPTION_CREATION_RETRY_LIMIT } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-creation-retry-limit.constant';
import {
  RevokeWebhookSubscriptionJob,
  type RevokeWebhookSubscriptionJobData,
} from 'src/modules/connected-account/webhook-subscription-manager/jobs/revoke-webhook-subscription.job';

const LIVE_WEBHOOK_SUBSCRIPTION_STATUSES: WebhookSubscriptionStatus[] = [
  WebhookSubscriptionStatus.ACTIVE,
  WebhookSubscriptionStatus.FAILED,
];

@Injectable()
export class WebhookSubscriptionRevocationService {
  constructor(
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
    @InjectMessageQueue(MessageQueue.webhookQueue)
    private readonly webhookQueueService: MessageQueueService,
  ) {}

  async enqueueWorkspaceRevocations(workspaceId: string): Promise<number> {
    const [messageChannels, calendarChannels] = await Promise.all([
      this.messageChannelRepository.find({
        where: {
          workspaceId,
          webhookSubscriptionStatus: In(LIVE_WEBHOOK_SUBSCRIPTION_STATUSES),
        },
        select: { id: true },
      }),
      this.calendarChannelRepository.find({
        where: {
          workspaceId,
          webhookSubscriptionStatus: In(LIVE_WEBHOOK_SUBSCRIPTION_STATUSES),
        },
        select: { id: true },
      }),
    ]);

    const revocations: RevokeWebhookSubscriptionJobData[] = [
      ...messageChannels.map((channel) => ({
        channelType: WebhookSubscriptionChannelType.MESSAGING,
        channelId: channel.id,
        workspaceId,
      })),
      ...calendarChannels.map((channel) => ({
        channelType: WebhookSubscriptionChannelType.CALENDAR,
        channelId: channel.id,
        workspaceId,
      })),
    ];

    if (revocations.length === 0) {
      return 0;
    }

    await this.webhookQueueService.bulkAdd<RevokeWebhookSubscriptionJobData>(
      RevokeWebhookSubscriptionJob.name,
      revocations.map((data) => ({ data })),
      { retryLimit: WEBHOOK_SUBSCRIPTION_CREATION_RETRY_LIMIT },
    );

    return revocations.length;
  }
}
