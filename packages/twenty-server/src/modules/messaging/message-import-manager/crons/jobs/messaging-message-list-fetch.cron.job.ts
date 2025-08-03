import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { MessageChannelSyncStage } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessagingMessageListFetchJob,
  MessagingMessageListFetchJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';

export const MESSAGING_MESSAGE_LIST_FETCH_CRON_PATTERN = '*/2 * * * *';

@Processor(MessageQueue.cronQueue)
export class MessagingMessageListFetchCronJob {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
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

    const mainDataSource =
      await this.workspaceDataSourceService.connectToMainDataSource();

    for (const activeWorkspace of activeWorkspaces) {
      try {
        const schemaName = getWorkspaceSchemaName(activeWorkspace.id);

        // TODO: deprecate looking for FULL_MESSAGE_LIST_FETCH_PENDING as we introduce MESSAGE_LIST_FETCH_PENDING
        const messageChannels = await mainDataSource.query(
          `SELECT * FROM ${schemaName}."messageChannel" WHERE "isSyncEnabled" = true AND "syncStage" IN ('${MessageChannelSyncStage.PARTIAL_MESSAGE_LIST_FETCH_PENDING}', '${MessageChannelSyncStage.FULL_MESSAGE_LIST_FETCH_PENDING}')`,
        );

        for (const messageChannel of messageChannels) {
          await this.messageQueueService.add<MessagingMessageListFetchJobData>(
            MessagingMessageListFetchJob.name,
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
