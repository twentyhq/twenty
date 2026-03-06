import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
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
import {
  DataSourceException,
  DataSourceExceptionCode,
} from 'src/engine/metadata-modules/data-source/data-source.exception';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { MessageChannelSyncStage } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessagingMessagesImportJob,
  type MessagingMessagesImportJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-messages-import.job';

export const MESSAGING_MESSAGES_IMPORT_CRON_PATTERN = '*/1 * * * *';

@Processor(MessageQueue.cronQueue)
export class MessagingMessagesImportCronJob {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  @Process(MessagingMessagesImportCronJob.name)
  @SentryCronMonitor(
    MessagingMessagesImportCronJob.name,
    MESSAGING_MESSAGES_IMPORT_CRON_PATTERN,
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

        const now = new Date().toISOString();

        const [messageChannels] = await this.coreDataSource.query(
          `UPDATE ${schemaName}."messageChannel" SET "syncStage" = '${MessageChannelSyncStage.MESSAGES_IMPORT_SCHEDULED}', "syncStageStartedAt" = COALESCE("syncStageStartedAt", '${now}')
          WHERE "isSyncEnabled" = true AND "syncStage" = '${MessageChannelSyncStage.MESSAGES_IMPORT_PENDING}' RETURNING *`,
        );

        for (const messageChannel of messageChannels) {
          await this.messageQueueService.add<MessagingMessagesImportJobData>(
            MessagingMessagesImportJob.name,
            {
              workspaceId: activeWorkspace.id,
              messageChannelId: messageChannel.id,
            },
          );
        }
      } catch (error) {
        // We had issues with the workspace schema not being found, due
        // to users deleting their workspaces in the middle of the cron job
        // We only throw an error when the workspace is found & schema not found
        if (
          error.code === '42P01' &&
          error.message.includes('messageChannel" does not exist')
        ) {
          const refetchedWorkspace = await this.workspaceRepository.findOneBy({
            id: activeWorkspace.id,
          });

          if (isDefined(refetchedWorkspace)) {
            this.exceptionHandlerService.captureExceptions([error], {
              workspace: {
                id: activeWorkspace.id,
              },
            });
            throw new DataSourceException(
              'Workspace schema not found while the workspace is still active',
              DataSourceExceptionCode.DATA_SOURCE_NOT_FOUND,
            );
          }
        } else {
          this.exceptionHandlerService.captureExceptions([error], {
            workspace: {
              id: activeWorkspace.id,
            },
          });
        }
      }
    }
  }
}
