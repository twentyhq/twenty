import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In, Repository } from 'typeorm';

import {
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
} from 'twenty-shared/types';
import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  MessagingRelaunchFailedMessageChannelJob,
  type MessagingRelaunchFailedMessageChannelJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-relaunch-failed-message-channel.job';

export const MESSAGING_RELAUNCH_FAILED_MESSAGE_CHANNELS_CRON_PATTERN =
  '*/30 * * * *';

@Processor(MessageQueue.cronQueue)
export class MessagingRelaunchFailedMessageChannelsCronJob {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(MessagingRelaunchFailedMessageChannelsCronJob.name)
  @SentryCronMonitor(
    MessagingRelaunchFailedMessageChannelsCronJob.name,
    MESSAGING_RELAUNCH_FAILED_MESSAGE_CHANNELS_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const activeWorkspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    });

    const activeWorkspaceIds = activeWorkspaces.map(
      (workspace) => workspace.id,
    );

    if (activeWorkspaceIds.length === 0) {
      return;
    }

    const failedMessageChannels = await this.messageChannelRepository
      .find({
        where: {
          syncStage: MessageChannelSyncStage.FAILED,
          syncStatus: MessageChannelSyncStatus.FAILED_UNKNOWN,
          workspaceId: In(activeWorkspaceIds),
        },
      })
      .catch((error) => {
        this.exceptionHandlerService.captureExceptions([error]);

        return [];
      });

    for (const messageChannel of failedMessageChannels) {
      try {
        await this.messageQueueService.add<MessagingRelaunchFailedMessageChannelJobData>(
          MessagingRelaunchFailedMessageChannelJob.name,
          {
            workspaceId: messageChannel.workspaceId,
            messageChannelId: messageChannel.id,
          },
        );
      } catch (error) {
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: {
            id: messageChannel.workspaceId,
          },
        });
      }
    }
  }
}
