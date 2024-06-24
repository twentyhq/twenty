import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository, In } from 'typeorm';
import snakeCase from 'lodash.snakecase';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { MessageChannelRepository } from 'src/modules/messaging/common/repositories/message-channel.repository';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { MessagingTelemetryService } from 'src/modules/messaging/common/services/messaging-telemetry.service';

@Processor(MessageQueue.cronQueue)
export class MessagingMessageChannelSyncStatusMonitoringCronJob {
  private readonly logger = new Logger(
    MessagingMessageChannelSyncStatusMonitoringCronJob.name,
  );

  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(DataSourceEntity, 'metadata')
    private readonly dataSourceRepository: Repository<DataSourceEntity>,
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: MessageChannelRepository,
    private readonly environmentService: EnvironmentService,
    private readonly messagingTelemetryService: MessagingTelemetryService,
  ) {}

  @Process(MessagingMessageChannelSyncStatusMonitoringCronJob.name)
  async handle(): Promise<void> {
    this.logger.log('Starting message channel sync status monitoring...');

    await this.messagingTelemetryService.track({
      eventName: 'message_channel.monitoring.sync_status.start',
      message: 'Starting message channel sync status monitoring',
    });

    const workspaceIds = (
      await this.workspaceRepository.find({
        where: this.environmentService.get('IS_BILLING_ENABLED')
          ? {
              subscriptionStatus: In(['active', 'trialing', 'past_due']),
            }
          : {},
        select: ['id'],
      })
    ).map((workspace) => workspace.id);

    const dataSources = await this.dataSourceRepository.find({
      where: {
        workspaceId: In(workspaceIds),
      },
    });

    const workspaceIdsWithDataSources = new Set(
      dataSources.map((dataSource) => dataSource.workspaceId),
    );

    for (const workspaceId of workspaceIdsWithDataSources) {
      const messageChannels =
        await this.messageChannelRepository.getAll(workspaceId);

      for (const messageChannel of messageChannels) {
        if (!messageChannel.syncStatus) {
          continue;
        }
        await this.messagingTelemetryService.track({
          eventName: `message_channel.monitoring.sync_status.${snakeCase(
            messageChannel.syncStatus,
          )}`,
          workspaceId,
          connectedAccountId: messageChannel.connectedAccountId,
          messageChannelId: messageChannel.id,
          message: messageChannel.syncStatus,
        });
      }
    }
  }
}
