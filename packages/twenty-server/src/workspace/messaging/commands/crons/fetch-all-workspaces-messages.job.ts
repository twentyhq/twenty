import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import { ConnectedAccountService } from 'src/workspace/messaging/repositories/connected-account/connected-account.service';
import { Workspace } from 'src/core/workspace/workspace.entity';
import {
  GmailPartialSyncJobData,
  GmailPartialSyncJob,
} from 'src/workspace/messaging/jobs/gmail-partial-sync.job';

@Injectable()
export class FetchAllWorkspacesMessagesJob
  implements MessageQueueJob<undefined>
{
  private readonly logger = new Logger(FetchAllWorkspacesMessagesJob.name);

  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
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

    for (const workspaceId of workspaceIds) {
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
