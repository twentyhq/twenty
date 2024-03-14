import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository, In } from 'typeorm';

import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import { ConnectedAccountService } from 'src/workspace/calendar-and-messaging/repositories/connected-account/connected-account.service';
import { Workspace } from 'src/core/workspace/workspace.entity';
import {
  GmailPartialSyncJobData,
  GmailPartialSyncJob,
} from 'src/workspace/messaging/jobs/gmail-partial-sync.job';
import { DataSourceEntity } from 'src/metadata/data-source/data-source.entity';

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
    private readonly connectedAccountService: ConnectedAccountService,
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
      const connectedAccounts =
        await this.connectedAccountService.getAll(workspaceId);

      for (const connectedAccount of connectedAccounts) {
        await this.messageQueueService.add<GmailPartialSyncJobData>(
          GmailPartialSyncJob.name,
          {
            workspaceId,
            connectedAccountId: connectedAccount.id,
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
