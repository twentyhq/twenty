import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  CalendarChannelSyncStage,
  MessageChannelSyncStage,
  WebhookSubscriptionChannelType,
  WebhookSubscriptionStatus,
} from 'twenty-shared/types';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import {
  type FindManyOptions,
  In,
  IsNull,
  LessThanOrEqual,
  Not,
  Repository,
} from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WEBHOOK_CAPABLE_PROVIDERS } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-capable-providers.constant';
import { WEBHOOK_SUBSCRIPTION_CREATION_RETRY_LIMIT } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-creation-retry-limit.constant';
import { WEBHOOK_SUBSCRIPTION_RENEWAL_BATCH_SIZE } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-renewal-batch-size.constant';
import { WEBHOOK_SUBSCRIPTION_RENEWAL_BUFFER_MS } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-renewal-buffer-ms.constant';
import { WEBHOOK_SUBSCRIPTION_RENEWAL_CRON_PATTERN } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-renewal-cron-pattern.constant';
import { WEBHOOK_SUBSCRIPTION_RENEWAL_MAX_TOTAL_DELAY_MS } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-renewal-max-total-delay-ms.constant';
import { WEBHOOK_SUBSCRIPTION_RENEWAL_SPACING_MS } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-renewal-spacing-ms.constant';
import {
  RenewWebhookSubscriptionJob,
  type RenewWebhookSubscriptionJobData,
} from 'src/modules/connected-account/webhook-subscription-manager/jobs/renew-webhook-subscription.job';

type WebhookSubscribableChannel = MessageChannelEntity | CalendarChannelEntity;

type StaleChannel = Pick<WebhookSubscribableChannel, 'id' | 'workspaceId'>;

type StaleChannelToEnqueue = {
  channelType: WebhookSubscriptionChannelType;
  channel: StaleChannel;
};

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
    private readonly twentyConfigService: TwentyConfigService,
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

    const isSubscriptionCreationEnabled = this.twentyConfigService.get(
      'IS_CONNECTED_ACCOUNT_WEBHOOK_SUBSCRIPTION_ENABLED',
    );

    const [
      expiringMessageChannels,
      expiringCalendarChannels,
      missingMessageChannels,
      missingCalendarChannels,
    ] = await Promise.all([
      this.findRenewableSubscriptions(
        this.messageChannelRepository,
        activeWorkspaceIds,
      ),
      this.findRenewableSubscriptions(
        this.calendarChannelRepository,
        activeWorkspaceIds,
      ),
      isSubscriptionCreationEnabled
        ? this.findMessageChannelsMissingSubscription(activeWorkspaceIds)
        : Promise.resolve([]),
      isSubscriptionCreationEnabled
        ? this.findCalendarChannelsMissingSubscription(activeWorkspaceIds)
        : Promise.resolve([]),
    ]);

    const staleChannels: StaleChannelToEnqueue[] = [
      ...this.toEnqueueEntries(
        WebhookSubscriptionChannelType.MESSAGING,
        expiringMessageChannels,
      ),
      ...this.toEnqueueEntries(
        WebhookSubscriptionChannelType.CALENDAR,
        expiringCalendarChannels,
      ),
      ...this.toEnqueueEntries(
        WebhookSubscriptionChannelType.MESSAGING,
        missingMessageChannels,
      ),
      ...this.toEnqueueEntries(
        WebhookSubscriptionChannelType.CALENDAR,
        missingCalendarChannels,
      ),
    ];

    if (staleChannels.length === 0) {
      return;
    }

    const spacingMs = await this.enqueueRenewals(staleChannels);

    this.logger.log(
      `Enqueued webhook subscription renewals: ${expiringMessageChannels.length + expiringCalendarChannels.length} expiring, ${missingMessageChannels.length + missingCalendarChannels.length} missing, spaced ${spacingMs}ms apart`,
    );
  }

  private toEnqueueEntries(
    channelType: WebhookSubscriptionChannelType,
    channels: StaleChannel[],
  ): StaleChannelToEnqueue[] {
    return channels.map((channel) => ({ channelType, channel }));
  }

  private buildStaleChannelScope(activeWorkspaceIds: string[]) {
    return {
      workspaceId: In(activeWorkspaceIds),
      isSyncEnabled: true,
      connectedAccount: {
        authFailedAt: IsNull(),
        provider: In(WEBHOOK_CAPABLE_PROVIDERS),
      },
    };
  }

  private findRenewableSubscriptions<
    TChannel extends WebhookSubscribableChannel,
  >(
    repository: Repository<TChannel>,
    activeWorkspaceIds: string[],
  ): Promise<StaleChannel[]> {
    const scope = this.buildStaleChannelScope(activeWorkspaceIds);

    const options: FindManyOptions<WebhookSubscribableChannel> = {
      where: [
        {
          ...scope,
          webhookSubscriptionStatus: WebhookSubscriptionStatus.ACTIVE,
          webhookSubscriptionExpiresAt: LessThanOrEqual(
            new Date(Date.now() + WEBHOOK_SUBSCRIPTION_RENEWAL_BUFFER_MS),
          ),
        },
        {
          ...scope,
          webhookSubscriptionStatus: WebhookSubscriptionStatus.FAILED,
        },
      ],
      select: { id: true, workspaceId: true },
    };

    return repository.find(options as FindManyOptions<TChannel>);
  }

  private findMessageChannelsMissingSubscription(
    activeWorkspaceIds: string[],
  ): Promise<StaleChannel[]> {
    const scope = this.buildStaleChannelScope(activeWorkspaceIds);

    return this.messageChannelRepository.find({
      where: [
        {
          ...scope,
          webhookSubscriptionStatus: IsNull(),
          syncStage: Not(MessageChannelSyncStage.PENDING_CONFIGURATION),
        },
        {
          ...scope,
          webhookSubscriptionStatus: WebhookSubscriptionStatus.EXPIRED,
        },
      ],
      order: { updatedAt: 'ASC' },
      take: WEBHOOK_SUBSCRIPTION_RENEWAL_BATCH_SIZE,
      select: { id: true, workspaceId: true, updatedAt: true },
    });
  }

  private findCalendarChannelsMissingSubscription(
    activeWorkspaceIds: string[],
  ): Promise<StaleChannel[]> {
    const scope = this.buildStaleChannelScope(activeWorkspaceIds);

    return this.calendarChannelRepository.find({
      where: [
        {
          ...scope,
          webhookSubscriptionStatus: IsNull(),
          syncStage: Not(CalendarChannelSyncStage.PENDING_CONFIGURATION),
        },
        {
          ...scope,
          webhookSubscriptionStatus: WebhookSubscriptionStatus.EXPIRED,
        },
      ],
      order: { updatedAt: 'ASC' },
      take: WEBHOOK_SUBSCRIPTION_RENEWAL_BATCH_SIZE,
      select: { id: true, workspaceId: true, updatedAt: true },
    });
  }

  private async enqueueRenewals(
    staleChannels: StaleChannelToEnqueue[],
  ): Promise<number> {
    const spacingMs = Math.min(
      WEBHOOK_SUBSCRIPTION_RENEWAL_SPACING_MS,
      WEBHOOK_SUBSCRIPTION_RENEWAL_MAX_TOTAL_DELAY_MS / staleChannels.length,
    );

    for (const [index, { channelType, channel }] of staleChannels.entries()) {
      await this.webhookQueueService.add<RenewWebhookSubscriptionJobData>(
        RenewWebhookSubscriptionJob.name,
        {
          channelType,
          channelId: channel.id,
          workspaceId: channel.workspaceId,
        },
        {
          retryLimit: WEBHOOK_SUBSCRIPTION_CREATION_RETRY_LIMIT,
          delay: Math.round(index * spacingMs),
        },
      );
    }

    return spacingMs;
  }
}
