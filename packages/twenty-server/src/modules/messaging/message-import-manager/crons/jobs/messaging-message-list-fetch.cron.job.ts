import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { FeatureFlagKey } from 'twenty-shared/types';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { DataSource, Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { MessageChannelSyncStage } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessagingMessageListFetchJob,
  type MessagingMessageListFetchJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';

export const MESSAGING_MESSAGE_LIST_FETCH_CRON_PATTERN = '2-59/5 * * * *';

@Processor(MessageQueue.cronQueue)
export class MessagingMessageListFetchCronJob {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly featureFlagService: FeatureFlagService,
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
        const now = new Date().toISOString();

        // TODO: remove workspace schema branch once IS_CONNECTED_ACCOUNT_MIGRATED feature flag is removed
        const isMigrated = await this.featureFlagService.isFeatureEnabled(
          FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED,
          activeWorkspace.id,
        );

        const [messageChannels] = isMigrated
          ? await this.coreDataSource.query(
              `UPDATE core."messageChannel" SET "syncStage" = '${MessageChannelSyncStage.MESSAGE_LIST_FETCH_SCHEDULED}', "syncStageStartedAt" = COALESCE("syncStageStartedAt", '${now}')
               WHERE "workspaceId" = '${activeWorkspace.id}' AND "isSyncEnabled" = true AND "syncStage" = '${MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING}' RETURNING *`,
            )
          : await this.coreDataSource.query(
              `UPDATE ${getWorkspaceSchemaName(activeWorkspace.id)}."messageChannel" SET "syncStage" = '${MessageChannelSyncStage.MESSAGE_LIST_FETCH_SCHEDULED}', "syncStageStartedAt" = COALESCE("syncStageStartedAt", '${now}')
               WHERE "isSyncEnabled" = true AND "syncStage" = '${MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING}' RETURNING *`,
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
