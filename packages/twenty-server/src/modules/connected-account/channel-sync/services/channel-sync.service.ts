import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { POLLED_MESSAGE_CHANNEL_TYPES } from 'twenty-shared/constants';
import {
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
  MessageChannelSyncStage,
  WebhookSubscriptionChannelType,
} from 'twenty-shared/types';
import { In, Repository } from 'typeorm';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  CalendarEventListFetchJob,
  type CalendarEventListFetchJobData,
} from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-event-list-fetch.job';
import { WEBHOOK_SUBSCRIPTION_JOB_RETRY_LIMIT } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-job-retry-limit.constant';
import {
  CreateWebhookSubscriptionJob,
  type CreateWebhookSubscriptionJobData,
} from 'src/modules/connected-account/webhook-subscription-manager/jobs/create-webhook-subscription.job';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import {
  MessagingMessageListFetchJob,
  type MessagingMessageListFetchJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';

export type StartChannelSyncInput = {
  connectedAccountId: string;
  workspaceId: string;
};

@Injectable()
export class ChannelSyncService {
  private readonly logger = new Logger(ChannelSyncService.name);

  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly calendarQueueService: MessageQueueService,
    @InjectMessageQueue(MessageQueue.webhookQueue)
    private readonly webhookQueueService: MessageQueueService,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
    @InjectWorkspaceScopedRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: WorkspaceScopedRepository<CalendarChannelEntity>,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async startChannelSync(input: StartChannelSyncInput): Promise<void> {
    const { connectedAccountId, workspaceId } = input;

    await this.startMessageChannelSync(connectedAccountId, workspaceId);
    await this.startCalendarChannelSync(connectedAccountId, workspaceId);
  }

  private async startMessageChannelSync(
    connectedAccountId: string,
    workspaceId: string,
  ): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageChannels = await this.messageChannelRepository.find({
        where: {
          connectedAccountId,
          syncStage: MessageChannelSyncStage.PENDING_CONFIGURATION,
          type: In([...POLLED_MESSAGE_CHANNEL_TYPES]),
          workspaceId,
        },
      });

      for (const messageChannel of messageChannels) {
        await this.messageChannelSyncStatusService.markAsMessagesListFetchScheduled(
          [messageChannel.id],
          workspaceId,
        );

        await this.messageQueueService.add<MessagingMessageListFetchJobData>(
          MessagingMessageListFetchJob.name,
          {
            workspaceId,
            messageChannelId: messageChannel.id,
          },
        );

        if (
          !this.twentyConfigService.get(
            'IS_CONNECTED_ACCOUNT_WEBHOOK_SUBSCRIPTION_ENABLED',
          )
        ) {
          continue;
        }

        try {
          await this.webhookQueueService.add<CreateWebhookSubscriptionJobData>(
            CreateWebhookSubscriptionJob.name,
            {
              channelType: WebhookSubscriptionChannelType.MESSAGING,
              channelId: messageChannel.id,
              workspaceId,
            },
            { retryLimit: WEBHOOK_SUBSCRIPTION_JOB_RETRY_LIMIT },
          );
        } catch (error) {
          this.logger.warn(
            `Failed to enqueue webhook subscription job for message channel ${messageChannel.id}`,
            error,
          );
        }
      }
    }, authContext);
  }

  private async startCalendarChannelSync(
    connectedAccountId: string,
    workspaceId: string,
  ): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const calendarChannels = await this.calendarChannelRepository.find(
        workspaceId,
        {
          where: {
            connectedAccountId,
            syncStage: CalendarChannelSyncStage.PENDING_CONFIGURATION,
          },
        },
      );

      for (const calendarChannel of calendarChannels) {
        await this.calendarChannelRepository.update(
          workspaceId,
          { id: calendarChannel.id },
          {
            syncStage:
              CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_SCHEDULED,
            syncStatus: CalendarChannelSyncStatus.ONGOING,
          },
        );

        await this.calendarQueueService.add<CalendarEventListFetchJobData>(
          CalendarEventListFetchJob.name,
          {
            workspaceId,
            calendarChannelId: calendarChannel.id,
          },
        );

        if (
          !this.twentyConfigService.get(
            'IS_CONNECTED_ACCOUNT_WEBHOOK_SUBSCRIPTION_ENABLED',
          )
        ) {
          continue;
        }

        try {
          await this.webhookQueueService.add<CreateWebhookSubscriptionJobData>(
            CreateWebhookSubscriptionJob.name,
            {
              channelType: WebhookSubscriptionChannelType.CALENDAR,
              channelId: calendarChannel.id,
              workspaceId,
            },
            { retryLimit: WEBHOOK_SUBSCRIPTION_JOB_RETRY_LIMIT },
          );
        } catch (error) {
          this.logger.warn(
            `Failed to enqueue webhook subscription job for calendar channel ${calendarChannel.id}`,
            error,
          );
        }
      }
    }, authContext);
  }
}
