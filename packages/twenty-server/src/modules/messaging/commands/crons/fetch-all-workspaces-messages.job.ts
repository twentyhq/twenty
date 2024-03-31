import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository, In } from 'typeorm';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  GmailPartialSyncJobData,
  GmailPartialSyncJob,
} from 'src/modules/messaging/jobs/gmail-partial-sync.job';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import {
  GmailPartialSyncV2Job as GmailPartialSyncV2Job,
  GmailPartialSyncV2JobData as GmailPartialSyncV2JobData,
} from 'src/modules/messaging/jobs/gmail-partial-sync-v2.job';

@Injectable()
export class FetchAllWorkspacesMessagesJob
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
    @InjectObjectMetadataRepository(ConnectedAccountObjectMetadata)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {}

  async handle(): Promise<void> {
    const workspaceIds = (
      await this.workspaceRepository.find({
        where: {
          subscriptionStatus: 'active',
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
      const isFullSyncV2Enabled = await this.featureFlagRepository.findOneBy({
        workspaceId,
        key: FeatureFlagKeys.IsFullSyncV2Enabled,
        value: true,
      });

      const connectedAccounts =
        await this.connectedAccountRepository.getAll(workspaceId);

      for (const connectedAccount of connectedAccounts) {
        if (isFullSyncV2Enabled) {
          await this.messageQueueService.add<GmailPartialSyncV2JobData>(
            GmailPartialSyncV2Job.name,
            {
              workspaceId,
              connectedAccountId: connectedAccount.id,
            },
          );
        } else {
          await this.messageQueueService.add<GmailPartialSyncJobData>(
            GmailPartialSyncJob.name,
            {
              workspaceId,
              connectedAccountId: connectedAccount.id,
            },
          );
        }
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
