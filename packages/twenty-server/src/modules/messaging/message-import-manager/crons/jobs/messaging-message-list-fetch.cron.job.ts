import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import groupBy from 'lodash.groupby';
import { POLLED_MESSAGE_CHANNEL_TYPES } from 'twenty-shared/constants';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In, IsNull, Repository } from 'typeorm';

import {
  MessageChannelSyncStage,
  WebhookSubscriptionStatus,
} from 'twenty-shared/types';
import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  MessagingMessageListFetchJob,
  type MessagingMessageListFetchJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';
import { isLastSuccessfulSyncStale } from 'src/modules/connected-account/utils/is-last-successful-sync-stale.util';
import { isThrottled } from 'src/modules/connected-account/utils/is-throttled';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { toIsoStringOrNull } from 'src/utils/date/toIsoStringOrNull';

export const MESSAGING_MESSAGE_LIST_FETCH_CRON_PATTERN = '2-59/5 * * * *';

@Processor(MessageQueue.cronQueue)
export class MessagingMessageListFetchCronJob {
  private readonly logger = new Logger(MessagingMessageListFetchCronJob.name);

  constructor(
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
  ) {}

  @Process(MessagingMessageListFetchCronJob.name)
  @SentryCronMonitor(
    MessagingMessageListFetchCronJob.name,
    MESSAGING_MESSAGE_LIST_FETCH_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const pendingMessageChannelsAcrossWorkspaces =
      await this.messageChannelRepository.find({
        where: {
          isSyncEnabled: true,
          syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
          type: In([...POLLED_MESSAGE_CHANNEL_TYPES]),
          workspace: {
            activationStatus: WorkspaceActivationStatus.ACTIVE,
            deletedAt: IsNull(),
          },
        },
      });

    const pendingMessageChannelsByWorkspaceId = groupBy(
      pendingMessageChannelsAcrossWorkspaces,
      'workspaceId',
    );

    for (const [workspaceId, pendingMessageChannels] of Object.entries(
      pendingMessageChannelsByWorkspaceId,
    )) {
      try {
        const messageChannelsToSchedule = pendingMessageChannels.filter(
          (messageChannel) =>
            !isThrottled(
              toIsoStringOrNull(messageChannel.syncStageStartedAt),
              messageChannel.throttleFailureCount,
              toIsoStringOrNull(messageChannel.throttleRetryAfter),
            ) &&
            (messageChannel.webhookSubscriptionStatus !==
              WebhookSubscriptionStatus.ACTIVE ||
              isLastSuccessfulSyncStale(
                toIsoStringOrNull(messageChannel.syncedAt),
              )),
        );

        const throttledCount =
          pendingMessageChannels.length - messageChannelsToSchedule.length;

        if (throttledCount > 0) {
          this.logger.log(
            `Skipped ${throttledCount} throttled message channels for workspace ${workspaceId}`,
          );
        }

        if (messageChannelsToSchedule.length === 0) {
          continue;
        }

        const messageChannelIdsToSchedule = messageChannelsToSchedule.map(
          (messageChannel) => messageChannel.id,
        );

        const updatedIds =
          await this.messageChannelSyncStatusService.markAsMessagesListFetchScheduledIfPending(
            messageChannelIdsToSchedule,
            workspaceId,
          );

        for (const messageChannelId of updatedIds) {
          await this.messageQueueService.add<MessagingMessageListFetchJobData>(
            MessagingMessageListFetchJob.name,
            {
              workspaceId,
              messageChannelId,
            },
          );
        }
      } catch (error) {
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: {
            id: workspaceId,
          },
        });
      }
    }
  }
}
