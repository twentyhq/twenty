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
import { REVOCABLE_WEBHOOK_SUBSCRIPTION_STATUSES } from 'src/modules/connected-account/webhook-subscription-manager/constants/revocable-webhook-subscription-statuses.constant';
import { WEBHOOK_SUBSCRIPTION_JOB_RETRY_LIMIT } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-job-retry-limit.constant';
import { CreateWebhookSubscriptionJob } from 'src/modules/connected-account/webhook-subscription-manager/jobs/create-webhook-subscription.job';
import { RevokeWebhookSubscriptionJob } from 'src/modules/connected-account/webhook-subscription-manager/jobs/revoke-webhook-subscription.job';
import { type WebhookSubscriptionChannelReference } from 'src/modules/connected-account/webhook-subscription-manager/types/webhook-subscription-channel-reference.type';

@Injectable()
export class WebhookSubscriptionWorkspaceSyncService {
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
    const channels = await this.findChannels({
      workspaceId,
      webhookSubscriptionStatuses: REVOCABLE_WEBHOOK_SUBSCRIPTION_STATUSES,
    });

    await this.enqueue(RevokeWebhookSubscriptionJob.name, channels);
  }

  async enqueueCreations(workspaceId: string): Promise<void> {
    if (
      !this.twentyConfigService.get(
        'IS_CONNECTED_ACCOUNT_WEBHOOK_SUBSCRIPTION_ENABLED',
      )
    ) {
      return;
    }

    const channels = await this.findChannels({
      workspaceId,
      webhookSubscriptionStatuses: [WebhookSubscriptionStatus.EXPIRED],
      syncEnabledOnly: true,
    });

    await this.enqueue(CreateWebhookSubscriptionJob.name, channels);
  }

  private async findChannels({
    workspaceId,
    webhookSubscriptionStatuses,
    syncEnabledOnly = false,
  }: {
    workspaceId: string;
    webhookSubscriptionStatuses: WebhookSubscriptionStatus[];
    syncEnabledOnly?: boolean;
  }): Promise<WebhookSubscriptionChannelReference[]> {
    const where = {
      workspaceId,
      webhookSubscriptionStatus: In(webhookSubscriptionStatuses),
      ...(syncEnabledOnly ? { isSyncEnabled: true } : {}),
    };

    const messageChannels = await this.messageChannelRepository.find({
      where,
      select: { id: true },
    });
    const calendarChannels = await this.calendarChannelRepository.find({
      where,
      select: { id: true },
    });

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

  private async enqueue(
    jobName: string,
    channels: WebhookSubscriptionChannelReference[],
  ): Promise<void> {
    await this.webhookQueueService.bulkAdd(
      jobName,
      channels.map((data) => ({ data })),
      { retryLimit: WEBHOOK_SUBSCRIPTION_JOB_RETRY_LIMIT },
    );
  }
}
