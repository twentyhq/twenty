import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { cleanOnboardingWorkspacesCronPattern } from 'src/engine/workspace-manager/workspace-cleaner/crons/clean-onboarding-workspaces.cron.pattern';
import { CleanOnboardingWorkspacesJob } from 'src/engine/workspace-manager/workspace-cleaner/crons/clean-onboarding-workspaces.job';

@Command({
  name: 'cron:clean-onboarding-workspaces',
  description: 'Starts a cron job to clean onboarding workspaces',
})
export class CleanOnboardingWorkspacesCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: CleanOnboardingWorkspacesJob.name,
      data: undefined,
      options: {
        repeat: { pattern: cleanOnboardingWorkspacesCronPattern },
      },
    });
  }
}
