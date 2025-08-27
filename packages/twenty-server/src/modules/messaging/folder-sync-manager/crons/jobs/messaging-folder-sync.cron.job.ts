import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import {
  MessagingFolderSyncJob,
  type MessagingFolderSyncJobData,
} from 'src/modules/messaging/folder-sync-manager/jobs/messaging-folder-sync.job';

export const MESSAGING_FOLDER_SYNC_CRON_PATTERN = '*/30 * * * *';

@Processor(MessageQueue.cronQueue)
export class MessagingFolderSyncCronJob {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  @Process(MessagingFolderSyncCronJob.name)
  @SentryCronMonitor(
    MessagingFolderSyncCronJob.name,
    MESSAGING_FOLDER_SYNC_CRON_PATTERN,
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
        const isFolderControlEnabled =
          await this.featureFlagService.isFeatureEnabled(
            FeatureFlagKey.IS_MESSAGE_FOLDER_CONTROL_ENABLED,
            activeWorkspace.id,
          );

        if (!isFolderControlEnabled) {
          continue;
        }

        const schemaName = getWorkspaceSchemaName(activeWorkspace.id);

        const messageChannels = await mainDataSource.query(
          `SELECT * FROM ${schemaName}."messageChannel" WHERE "isSyncEnabled" = true`,
        );

        for (const messageChannel of messageChannels) {
          await this.messageQueueService.add<MessagingFolderSyncJobData>(
            MessagingFolderSyncJob.name,
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
