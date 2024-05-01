import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository, In } from 'typeorm';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import {
  GmailPartialSyncJobData,
  GmailPartialSyncJob,
} from 'src/modules/messaging/jobs/gmail-partial-sync.job';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel.repository';
import { MessageChannelObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel.object-metadata';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';

@Injectable()
export class GmailPartialSyncCronJob implements MessageQueueJob<undefined> {
  private readonly logger = new Logger(GmailPartialSyncCronJob.name);

  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(DataSourceEntity, 'metadata')
    private readonly dataSourceRepository: Repository<DataSourceEntity>,
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectObjectMetadataRepository(MessageChannelObjectMetadata)
    private readonly messageChannelRepository: MessageChannelRepository,
    private readonly environmentService: EnvironmentService,
  ) {}

  async handle(): Promise<void> {
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
      await this.enqueuePartialSyncs(workspaceId);
    }
  }

  private async enqueuePartialSyncs(workspaceId: string): Promise<void> {
    try {
      const messageChannels =
        await this.messageChannelRepository.getAll(workspaceId);

      for (const messageChannel of messageChannels) {
        if (!messageChannel?.isSyncEnabled) {
          continue;
        }

        await this.messageQueueService.add<GmailPartialSyncJobData>(
          GmailPartialSyncJob.name,
          {
            workspaceId,
            connectedAccountId: messageChannel.connectedAccountId,
          },
          {
            retryLimit: 2,
          },
        );
      }
    } catch (error) {
      this.logger.error(
        `Error while fetching workspace messages for workspace ${workspaceId}`,
      );
      this.logger.error(error);

      return;
    }
  }
}
