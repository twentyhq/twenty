import { InjectRepository } from '@nestjs/typeorm';

import snakeCase from 'lodash.snakecase';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessagingMonitoringService } from 'src/modules/messaging/monitoring/services/messaging-monitoring.service';

export const MESSAGING_MESSAGE_CHANNEL_SYNC_STATUS_MONITORING_CRON_PATTERN =
  '2/10 * * * *'; //Every 10 minutes, starting at 2 minutes past the hour

@Processor(MessageQueue.cronQueue)
export class MessagingMessageChannelSyncStatusMonitoringCronJob {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly messagingMonitoringService: MessagingMonitoringService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(MessagingMessageChannelSyncStatusMonitoringCronJob.name)
  @SentryCronMonitor(
    MessagingMessageChannelSyncStatusMonitoringCronJob.name,
    MESSAGING_MESSAGE_CHANNEL_SYNC_STATUS_MONITORING_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    await this.messagingMonitoringService.track({
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
        const authContext = buildSystemAuthContext(activeWorkspace.id);

        await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
          authContext,
          async () => {
            const messageChannelRepository =
              await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
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
              await this.messagingMonitoringService.track({
                eventName: `message_channel.monitoring.sync_status.${snakeCase(
                  messageChannel.syncStatus,
                )}`,
                workspaceId: activeWorkspace.id,
                connectedAccountId: messageChannel.connectedAccountId,
                messageChannelId: messageChannel.id,
                message: messageChannel.syncStatus,
              });
            }
          },
        );
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
