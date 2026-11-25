import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import { DeferredWorkspaceOperationRecoveryService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/deferred-workspace-operation-recovery.service';

type RetryFailedDeferredWorkspaceOperationsCommandOptions = {
  workspaceId?: string;
};

@Command({
  name: 'workspace:retry-failed-deferred-workspace-operations',
  description:
    'Reset FAILED deferred workspace operations to PENDING and enqueue them, for one workspace or all of them',
})
export class RetryFailedDeferredWorkspaceOperationsCommand extends CommandRunner {
  private readonly logger = new Logger(
    RetryFailedDeferredWorkspaceOperationsCommand.name,
  );

  constructor(
    private readonly deferredWorkspaceOperationRecoveryService: DeferredWorkspaceOperationRecoveryService,
  ) {
    super();
  }

  @Option({
    flags: '-w, --workspace-id <workspaceId>',
    description: 'Only retry the failed operations of this workspace',
    required: false,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  async run(
    _passedParams: string[],
    options: RetryFailedDeferredWorkspaceOperationsCommandOptions,
  ): Promise<void> {
    const retriedOperationCount =
      await this.deferredWorkspaceOperationRecoveryService.retryFailedOperations(
        options.workspaceId,
      );

    this.logger.log(
      `Retried ${retriedOperationCount} failed deferred workspace operation(s)`,
    );
  }
}
