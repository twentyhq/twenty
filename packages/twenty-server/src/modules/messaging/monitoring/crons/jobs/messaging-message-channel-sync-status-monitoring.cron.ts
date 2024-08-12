import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import snakeCase from 'lodash.snakecase';
import { Repository } from 'typeorm';

import {
  Workspace,
  WorkspaceActivationStatus,
} from 'src/engine/core-modules/workspace/workspace.entity';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { MessageChannelRepository } from 'src/modules/messaging/common/repositories/message-channel.repository';
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
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: MessageChannelRepository,
    private readonly messagingTelemetryService: MessagingTelemetryService,
  ) {}

  @Process(MessagingMessageChannelSyncStatusMonitoringCronJob.name)
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
      const messageChannels = await this.messageChannelRepository.getAll(
        activeWorkspace.id,
      );

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
  }
}
