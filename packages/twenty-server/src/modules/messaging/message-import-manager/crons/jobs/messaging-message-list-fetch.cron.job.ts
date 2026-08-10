import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In, Not, Repository } from 'typeorm';

import {
  MessageChannelSyncStage,
  MessageChannelType,
  WebhookSubscriptionStatus,
} from 'twenty-shared/types';
import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { MessagingSyncJobDispatcherService } from 'src/modules/messaging/message-import-manager/services/messaging-sync-job-dispatcher.service';
import { isLastSuccessfulSyncStale } from 'src/modules/connected-account/utils/is-last-successful-sync-stale.util';
import { isThrottled } from 'src/modules/connected-account/utils/is-throttled';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { toIsoStringOrNull } from 'src/utils/date/toIsoStringOrNull';

export const MESSAGING_MESSAGE_LIST_FETCH_CRON_PATTERN = '2-59/5 * * * *';

@Processor(MessageQueue.cronQueue)
export class MessagingMessageListFetchCronJob {
  private readonly logger = new Logger(MessagingMessageListFetchCronJob.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly messagingSyncJobDispatcherService: MessagingSyncJobDispatcherService,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(MessagingMessageListFetchCronJob.name)
  @SentryCronMonitor(
    MessagingMessageListFetchCronJob.name,
    MESSAGING_MESSAGE_LIST_FETCH_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const activeWorkspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    });

    for (const activeWorkspace of activeWorkspaces) {
      try {
        const pendingMessageChannels = await this.messageChannelRepository.find(
          {
            where: {
              workspaceId: activeWorkspace.id,
              isSyncEnabled: true,
              syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
              type: Not(MessageChannelType.EMAIL_GROUP),
            },
          },
        );

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
            `Skipped ${throttledCount} throttled message channels for workspace ${activeWorkspace.id}`,
          );
        }

        if (messageChannelsToSchedule.length === 0) {
          continue;
        }

        const messageChannelIdsToSchedule = messageChannelsToSchedule.map(
          (messageChannel) => messageChannel.id,
        );

        const updateResult = await this.messageChannelRepository
          .createQueryBuilder()
          .update()
          .set({
            syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_SCHEDULED,
            syncStageStartedAt: new Date(),
          })
          .where({
            id: In(messageChannelIdsToSchedule),
            workspaceId: activeWorkspace.id,
            isSyncEnabled: true,
            syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
          })
          .returning('id')
          .execute();

        const updatedIds: string[] = updateResult.raw.map(
          (row: { id: string }) => row.id,
        );

        const scheduledMessageChannels = messageChannelsToSchedule.filter(
          (messageChannel) => updatedIds.includes(messageChannel.id),
        );

        for (const messageChannel of scheduledMessageChannels) {
          await this.messagingSyncJobDispatcherService.enqueueMessageListFetch({
            messageChannel,
            workspaceId: activeWorkspace.id,
          });
        }
      } catch (error) {
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: {
            id: activeWorkspace.id,
          },
        });
      }
    }
  }
}
