import { Command } from 'nest-commander';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';

@Command({
  name: 'messaging:message-cleaner-remove-orphans',
  description: 'Remove orphan message and threads from messaging',
})
export class MessagingMessageCleanerRemoveOrphansCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly messagingMessageCleanerService: MessagingMessageCleanerService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    try {
      await this.messagingMessageCleanerService.cleanOrphanMessagesAndThreads(
        workspaceId,
      );
    } catch (error) {
      this.logger.error('Error while deleting workflowRun', error);
    }
  }
}
