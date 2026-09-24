import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import { DeferredWorkspaceMigrationActionRecoveryService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/deferred-workspace-migration-action-recovery.service';

type RetryFailedDeferredWorkspaceMigrationActionsCommandOptions = {
  workspaceId?: string;
};

@Command({
  name: 'workspace:retry-failed-deferred-migration-actions',
  description:
    'Reset FAILED deferred workspace migration actions to PENDING and enqueue them, for one workspace or all of them',
})
export class RetryFailedDeferredWorkspaceMigrationActionsCommand extends CommandRunner {
  private readonly logger = new Logger(
    RetryFailedDeferredWorkspaceMigrationActionsCommand.name,
  );

  constructor(
    private readonly deferredWorkspaceMigrationActionRecoveryService: DeferredWorkspaceMigrationActionRecoveryService,
  ) {
    super();
  }

  @Option({
    flags: '-w, --workspace-id <workspaceId>',
    description: 'Only retry the failed actions of this workspace',
    required: false,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  async run(
    _passedParams: string[],
    options: RetryFailedDeferredWorkspaceMigrationActionsCommandOptions,
  ): Promise<void> {
    const retriedActionCount =
      await this.deferredWorkspaceMigrationActionRecoveryService.retryFailedActions(
        options.workspaceId,
      );

    this.logger.log(
      `Retried ${retriedActionCount} failed deferred workspace migration action(s)`,
    );
  }
}
