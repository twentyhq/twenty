import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository, In } from 'typeorm';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { DataSourceEntity } from 'src/engine-metadata/data-source/data-source.entity';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { Workspace } from 'src/engine/modules/workspace/workspace.entity';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { FetchAllWorkspacesMessagesJob } from 'src/modules/messaging/commands/crons/fetch-all-workspaces-messages.job';
import {
  MessageChannelObjectMetadata,
  MessageChannelSyncStatus,
} from 'src/modules/messaging/standard-objects/message-channel.object-metadata';
import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel.repository';
import {
  GmailFetchMessageContentFromCacheJob,
  GmailFetchMessageContentFromCacheJobData,
} from 'src/modules/messaging/jobs/gmail-fetch-message-content-from-cache.job';
import { FeatureFlagKeys } from 'src/engine/modules/feature-flag/feature-flag.entity';

@Injectable()
export class FetchAllMessagesFromCacheCron
  implements MessageQueueJob<undefined>
{
  private readonly logger = new Logger(FetchAllWorkspacesMessagesJob.name);

  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(DataSourceEntity, 'metadata')
    private readonly dataSourceRepository: Repository<DataSourceEntity>,
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectObjectMetadataRepository(MessageChannelObjectMetadata)
    private readonly messageChannelRepository: MessageChannelRepository,
  ) {}

  async handle(): Promise<void> {
    const workspaceIds = (
      await this.workspaceRepository.find({
        where: {
          subscriptionStatus: 'active',
          featureFlags: {
            key: FeatureFlagKeys.IsFullSyncV2Enabled,
            value: true,
          },
        },
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
      await this.fetchWorkspaceMessages(workspaceId);
    }
  }

  private async fetchWorkspaceMessages(workspaceId: string): Promise<void> {
    try {
      const messageChannels =
        await this.messageChannelRepository.getAll(workspaceId);

      for (const messageChannel of messageChannels) {
        if (messageChannel.syncStatus !== MessageChannelSyncStatus.PENDING) {
          continue;
        }
        await this.messageQueueService.add<GmailFetchMessageContentFromCacheJobData>(
          GmailFetchMessageContentFromCacheJob.name,
          {
            workspaceId,
            connectedAccountId: messageChannel.connectedAccountId,
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
