import { InjectRepository } from '@nestjs/typeorm';

import { Command, CommandRunner, Option } from 'nest-commander';
import { Repository } from 'typeorm';

import { FeatureFlagEntity } from 'src/core/feature-flag/feature-flag.entity';
import { MessagingProducer } from 'src/workspace/messaging/producers/messaging-producer';
import { MessagingUtilsService } from 'src/workspace/messaging/services/messaging-utils.service';

interface GmailPartialSyncOptions {
  workspaceId: string;
}

@Command({
  name: 'workspace:gmail-partial-sync',
  description: 'Fetch messages of all workspaceMembers in a workspace.',
})
export class GmailPartialSyncCommand extends CommandRunner {
  constructor(
    private readonly messagingProducer: MessagingProducer,
    private readonly utils: MessagingUtilsService,

    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {
    super();
  }

  async run(
    _passedParam: string[],
    options: GmailPartialSyncOptions,
  ): Promise<void> {
    const isMessagingEnabled = await this.featureFlagRepository.findOneBy({
      workspaceId: options.workspaceId,
      key: 'IS_MESSAGING_ENABLED',
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
      await this.utils.getConnectedAccountsFromWorkspaceId(workspaceId);

    for (const connectedAccount of connectedAccounts) {
      await this.messagingProducer.enqueueGmailPartialSync(
        { workspaceId, connectedAccountId: connectedAccount.id },
        `${workspaceId}-${connectedAccount.id}`,
      );
    }
  }
}
