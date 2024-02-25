import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/core/feature-flag/feature-flag.entity';
import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import { ConnectedAccountService } from 'src/workspace/messaging/repositories/connected-account/connected-account.service';
import {
  GmailPartialSyncJobData,
  GmailPartialSyncJob,
} from 'src/workspace/messaging/jobs/gmail-partial-sync.job';

@Injectable()
export class FetchAllWorkspacesMessagesJob
  implements MessageQueueJob<undefined>
{
  constructor(
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly connectedAccountService: ConnectedAccountService,
  ) {}

  async handle(): Promise<void> {
    const featureFlagsWithMessagingEnabled =
      await this.featureFlagRepository.findBy({
        key: FeatureFlagKeys.IsMessagingEnabled,
        value: true,
      });

    const workspaceIds = featureFlagsWithMessagingEnabled.map(
      (featureFlag) => featureFlag.workspaceId,
    );

    for (const workspaceId of workspaceIds) {
      await this.fetchWorkspaceMessages(workspaceId);
    }
  }

  private async fetchWorkspaceMessages(workspaceId: string): Promise<void> {
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
  }
}
