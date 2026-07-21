import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  WebhookSubscriptionChannelType,
  WebhookSubscriptionStatus,
} from 'twenty-shared/types';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { type FindManyOptions, In, LessThanOrEqual, Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WEBHOOK_SUBSCRIPTION_RENEWAL_BUFFER_MS } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-renewal-buffer-ms.constant';
import { WEBHOOK_SUBSCRIPTION_RENEWAL_CRON_PATTERN } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-renewal-cron-pattern.constant';
import {
  RenewWebhookSubscriptionJob,
  type RenewWebhookSubscriptionJobData,
} from 'src/modules/connected-account/webhook-subscription-manager/jobs/renew-webhook-subscription.job';

type WebhookSubscribableChannel = MessageChannelEntity | CalendarChannelEntity;

type StaleChannel = Pick<WebhookSubscribableChannel, 'id' | 'workspaceId'>;

@Processor(MessageQueue.cronQueue)
export class WebhookSubscriptionRenewalCronJob {
  private readonly logger = new Logger(WebhookSubscriptionRenewalCronJob.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
    @InjectMessageQueue(MessageQueue.webhookQueue)
    private readonly webhookQueueService: MessageQueueService,
  ) {}

  @Process(WebhookSubscriptionRenewalCronJob.name)
  @SentryCronMonitor(
    WebhookSubscriptionRenewalCronJob.name,
    WEBHOOK_SUBSCRIPTION_RENEWAL_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const activeWorkspaces = await this.workspaceRepository.find({
      where: { activationStatus: WorkspaceActivationStatus.ACTIVE },
      select: { id: true },
    });

    const activeWorkspaceIds = activeWorkspaces.map(
      (workspace) => workspace.id,
    );

    if (activeWorkspaceIds.length === 0) {
      return;
    }

    const [messageChannels, calendarChannels] = await Promise.all([
      this.findStaleChannels(this.messageChannelRepository, activeWorkspaceIds),
      this.findStaleChannels(
        this.calendarChannelRepository,
        activeWorkspaceIds,
      ),
    ]);

    if (messageChannels.length === 0 && calendarChannels.length === 0) {
      return;
    }

    await Promise.all([
      this.enqueueRenewals(
        WebhookSubscriptionChannelType.MESSAGING,
        messageChannels,
      ),
      this.enqueueRenewals(
        WebhookSubscriptionChannelType.CALENDAR,
        calendarChannels,
      ),
    ]);

    this.logger.log(
      `Enqueued webhook subscription renewals: ${messageChannels.length} messaging, ${calendarChannels.length} calendar`,
    );
  }

  private findStaleChannels<TChannel extends WebhookSubscribableChannel>(
    repository: Repository<TChannel>,
    activeWorkspaceIds: string[],
  ): Promise<StaleChannel[]> {
    const workspaceScope = { workspaceId: In(activeWorkspaceIds) };
    const renewalThreshold = new Date(
      Date.now() + WEBHOOK_SUBSCRIPTION_RENEWAL_BUFFER_MS,
    );

    const options: FindManyOptions<WebhookSubscribableChannel> = {
      where: [
        {
          ...workspaceScope,
          webhookSubscriptionStatus: WebhookSubscriptionStatus.FAILED,
        },
        {
          ...workspaceScope,
          webhookSubscriptionStatus: WebhookSubscriptionStatus.ACTIVE,
          webhookSubscriptionExpiresAt: LessThanOrEqual(renewalThreshold),
        },
      ],
      select: { id: true, workspaceId: true },
    };

    return repository.find(options as FindManyOptions<TChannel>);
  }

  private async enqueueRenewals(
    channelType: WebhookSubscriptionChannelType,
    channels: StaleChannel[],
  ): Promise<void> {
    for (const channel of channels) {
      await this.webhookQueueService.add<RenewWebhookSubscriptionJobData>(
        RenewWebhookSubscriptionJob.name,
        {
          channelType,
          channelId: channel.id,
          workspaceId: channel.workspaceId,
        },
        {
          id: `${RenewWebhookSubscriptionJob.name}:${channelType}:${channel.id}`,
          retryLimit: 3,
        },
      );
    }
  }
}
