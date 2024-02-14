import { InjectRepository } from '@nestjs/typeorm';
import { Inject } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/core/feature-flag/feature-flag.entity';
import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import {
  GmailPartialSyncJob,
  GmailPartialSyncJobData,
} from 'src/workspace/messaging/jobs/gmail-partial-sync.job';
import { ConnectedAccountService } from 'src/workspace/messaging/repositories/connected-account/connected-account.service';

interface GmailPartialSyncOptions {
  workspaceId: string;
}

@Command({
  name: 'workspace:gmail-partial-sync',
  description: 'Fetch messages of all workspaceMembers in a workspace.',
})
export class GmailPartialSyncCommand extends CommandRunner {
  constructor(
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly connectedAccountService: ConnectedAccountService,
  ) {
    super();
  }

  async run(
    _passedParam: string[],
    options: GmailPartialSyncOptions,
  ): Promise<void> {
    const isMessagingEnabled = await this.featureFlagRepository.findOneBy({
      workspaceId: options.workspaceId,
      key: FeatureFlagKeys.IsMessagingEnabled,
      value: true,
    });

    if (!isMessagingEnabled) {
      throw new Error('Messaging is not enabled for this workspace');
    }

    await this.fetchWorkspaceMessages(options.workspaceId);

    return;
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id',
    required: true,
  })
  parseWorkspaceId(value: string): string {
    return value;
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
