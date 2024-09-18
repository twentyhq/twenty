import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import snakeCase from 'lodash.snakecase';
import { Repository } from 'typeorm';

import {
  Workspace,
  WorkspaceActivationStatus,
} from 'src/engine/core-modules/workspace/workspace.entity';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessagingTelemetryService } from 'src/modules/messaging/monitoring/services/messaging-telemetry.service';

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
  ) {}

  @Process(MessagingMessageChannelSyncStatusMonitoringCronJob.name)
  async handle(): Promise<void> {
    this.logger.log('Starting message channel sync status monitoring...');

    console.time('MessagingMessageChannelSyncStatusMonitoringCronJob time');

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
    }

    console.timeEnd('MessagingMessageChannelSyncStatusMonitoringCronJob time');
  }
}
