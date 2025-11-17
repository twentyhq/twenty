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
import { MessageFolderPendingSyncAction } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import {
  MessagingProcessFolderActionsJob,
  type MessagingProcessFolderActionsJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-process-folder-actions.job';

export const MESSAGING_PROCESS_FOLDER_ACTIONS_CRON_PATTERN = '*/15 * * * *';

@Processor(MessageQueue.cronQueue)
export class MessagingProcessFolderActionsCronJob {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(MessagingProcessFolderActionsCronJob.name)
  @SentryCronMonitor(
    MessagingProcessFolderActionsCronJob.name,
    MESSAGING_PROCESS_FOLDER_ACTIONS_CRON_PATTERN,
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

        const messageChannels = await this.coreDataSource.query(
          `SELECT DISTINCT mc.id
           FROM ${schemaName}."messageChannel" mc
           INNER JOIN ${schemaName}."messageFolder" mf ON mf."messageChannelId" = mc.id
           WHERE mf."pendingSyncAction" = '${MessageFolderPendingSyncAction.FOLDER_DELETION}'`,
        );

        for (const messageChannel of messageChannels) {
          await this.messageQueueService.add<MessagingProcessFolderActionsJobData>(
            MessagingProcessFolderActionsJob.name,
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
