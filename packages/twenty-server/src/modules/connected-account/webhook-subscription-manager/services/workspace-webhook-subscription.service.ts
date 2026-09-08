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
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WEBHOOK_SUBSCRIPTION_CREATION_RETRY_LIMIT } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-creation-retry-limit.constant';
import {
  CreateWebhookSubscriptionJob,
  type CreateWebhookSubscriptionJobData,
} from 'src/modules/connected-account/webhook-subscription-manager/jobs/create-webhook-subscription.job';
import {
  RevokeWebhookSubscriptionJob,
  type RevokeWebhookSubscriptionJobData,
} from 'src/modules/connected-account/webhook-subscription-manager/jobs/revoke-webhook-subscription.job';

const LIVE_WEBHOOK_SUBSCRIPTION_STATUSES: WebhookSubscriptionStatus[] = [
  WebhookSubscriptionStatus.ACTIVE,
  WebhookSubscriptionStatus.FAILED,
];

@Injectable()
export class WorkspaceWebhookSubscriptionService {
  constructor(
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
    @InjectMessageQueue(MessageQueue.webhookQueue)
    private readonly webhookQueueService: MessageQueueService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async enqueueRevocations(workspaceId: string): Promise<void> {
    const channels = await this.findChannelsByWebhookSubscriptionStatus(
      workspaceId,
      LIVE_WEBHOOK_SUBSCRIPTION_STATUSES,
    );

    if (channels.length === 0) {
      return;
    }

    await this.webhookQueueService.bulkAdd<RevokeWebhookSubscriptionJobData>(
      RevokeWebhookSubscriptionJob.name,
      channels.map((data) => ({ data })),
      { retryLimit: WEBHOOK_SUBSCRIPTION_CREATION_RETRY_LIMIT },
    );
  }

  async enqueueCreations(workspaceId: string): Promise<void> {
    if (
      !this.twentyConfigService.get(
        'IS_CONNECTED_ACCOUNT_WEBHOOK_SUBSCRIPTION_ENABLED',
      )
    ) {
      return;
    }

    const channels = await this.findChannelsByWebhookSubscriptionStatus(
      workspaceId,
      [WebhookSubscriptionStatus.EXPIRED],
    );

    if (channels.length === 0) {
      return;
    }

    await this.webhookQueueService.bulkAdd<CreateWebhookSubscriptionJobData>(
      CreateWebhookSubscriptionJob.name,
      channels.map((data) => ({ data })),
      { retryLimit: WEBHOOK_SUBSCRIPTION_CREATION_RETRY_LIMIT },
    );
  }

  private async findChannelsByWebhookSubscriptionStatus(
    workspaceId: string,
    webhookSubscriptionStatuses: WebhookSubscriptionStatus[],
  ): Promise<RevokeWebhookSubscriptionJobData[]> {
    const where = {
      workspaceId,
      isSyncEnabled: true,
      webhookSubscriptionStatus: In(webhookSubscriptionStatuses),
    };

    const [messageChannels, calendarChannels] = await Promise.all([
      this.messageChannelRepository.find({ where, select: { id: true } }),
      this.calendarChannelRepository.find({ where, select: { id: true } }),
    ]);

    return [
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
  }
}
