import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { DataSource, Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import {
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
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
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
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

    for (const activeWorkspace of activeWorkspaces) {
      try {
        const schemaName = getWorkspaceSchemaName(activeWorkspace.id);

        const failedMessageChannels = await this.coreDataSource.query(
          `SELECT * FROM ${schemaName}."messageChannel" WHERE "syncStage" = '${MessageChannelSyncStage.FAILED}' AND "syncStatus" = '${MessageChannelSyncStatus.FAILED_UNKNOWN}'`,
        );

        for (const messageChannel of failedMessageChannels) {
          await this.messageQueueService.add<MessagingRelaunchFailedMessageChannelJobData>(
            MessagingRelaunchFailedMessageChannelJob.name,
            {
              workspaceId: activeWorkspace.id,
              messageChannelId: messageChannel.id,
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
