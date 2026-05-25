import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In, Not, Repository } from 'typeorm';

import {
  MessageChannelSyncStage,
  MessageChannelType,
} from 'twenty-shared/types';
import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  MessagingMessageListFetchJob,
  type MessagingMessageListFetchJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';
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
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
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
            ),
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

        const updatedIds = updateResult.raw.map(
          (row: { id: string }) => row.id,
        );

        for (const messageChannelId of updatedIds) {
          await this.messageQueueService.add<MessagingMessageListFetchJobData>(
            MessagingMessageListFetchJob.name,
            {
              workspaceId: activeWorkspace.id,
              messageChannelId,
            },
          );
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
