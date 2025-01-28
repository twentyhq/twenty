import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import snakeCase from 'lodash.snakecase';
import { WorkspaceActivationStatus } from 'twenty-shared';
import { Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessagingTelemetryService } from 'src/modules/messaging/monitoring/services/messaging-telemetry.service';

export const MESSAGING_MESSAGE_CHANNEL_SYNC_STATUS_MONITORING_CRON_PATTERN =
  '2/10 * * * *'; //Every 10 minutes, starting at 2 minutes past the hour

@Processor(MessageQueue.cronQueue)
export class MessagingMessageChannelSyncStatusMonitoringCronJob {
  private readonly logger = new Logger(
    MessagingMessageChannelSyncStatusMonitoringCronJob.name,
  );

  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly messagingTelemetryService: MessagingTelemetryService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(MessagingMessageChannelSyncStatusMonitoringCronJob.name)
  @SentryCronMonitor(
    MessagingMessageChannelSyncStatusMonitoringCronJob.name,
    MESSAGING_MESSAGE_CHANNEL_SYNC_STATUS_MONITORING_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    this.logger.log('Starting message channel sync status monitoring...');

    await this.messagingTelemetryService.track({
      eventName: 'message_channel.monitoring.sync_status.start',
      message: 'Starting message channel sync status monitoring',
    });

    const activeWorkspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    });

    for (const activeWorkspace of activeWorkspaces) {
      try {
        const messageChannelRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelWorkspaceEntity>(
            activeWorkspace.id,
            'messageChannel',
          );
        const messageChannels = await messageChannelRepository.find({
          select: ['id', 'syncStatus', 'connectedAccountId'],
        });

        for (const messageChannel of messageChannels) {
          if (!messageChannel.syncStatus) {
            continue;
          }
          await this.messagingTelemetryService.track({
            eventName: `message_channel.monitoring.sync_status.${snakeCase(
              messageChannel.syncStatus,
            )}`,
            workspaceId: activeWorkspace.id,
            connectedAccountId: messageChannel.connectedAccountId,
            messageChannelId: messageChannel.id,
            message: messageChannel.syncStatus,
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
