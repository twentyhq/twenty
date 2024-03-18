import { Inject } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import {
  GmailFullSyncJobData,
  GmailFullSyncJob,
} from 'src/modules/messaging/jobs/gmail-full-sync.job';
import { ConnectedAccountService } from 'src/modules/connected-account/repositories/connected-account/connected-account.service';

interface GmailFullSyncOptions {
  workspaceId: string;
}

@Command({
  name: 'workspace:gmail-full-sync',
  description: 'Fetch messages of all workspaceMembers in a workspace.',
})
export class GmailFullSyncCommand extends CommandRunner {
  constructor(
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly connectedAccountService: ConnectedAccountService,
  ) {
    super();
  }

  async run(
    _passedParam: string[],
    options: GmailFullSyncOptions,
  ): Promise<void> {
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
      await this.messageQueueService.add<GmailFullSyncJobData>(
        GmailFullSyncJob.name,
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
