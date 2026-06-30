import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import { WorkflowHandleStaledRunsWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-handle-staled-runs.workspace-service';

type WorkflowHandleStaledRunsCommandOptions = {
  workspaceIds: string[];
};

@Command({
  name: 'workflow:handle-staled-runs',
  description: 'Handles staled workflow runs',
})
export class WorkflowHandleStaledRunsCommand extends CommandRunner {
  private readonly logger = new Logger(WorkflowHandleStaledRunsCommand.name);

  constructor(
    private readonly workflowHandleStaledRunsWorkspaceService: WorkflowHandleStaledRunsWorkspaceService,
  ) {
    super();
  }

  @Option({
    flags: '-w, --workspace-ids [workspace_ids]',
    description: 'comma separated workspace ids - mandatory',
    required: true,
  })
  parseWorkspaceIds(val: string): string[] {
    return val.split(',');
  }

  async run(
    _passedParam: string[],
    options: WorkflowHandleStaledRunsCommandOptions,
  ): Promise<void> {
    const { workspaceIds } = options;

    this.logger.log('Starting WorkflowHandleStaledRunsCommand command');

    for (let i = 0; i < workspaceIds.length; i++) {
      const workspaceId = workspaceIds[i];

      this.logger.log(
        `Processing workspace ${workspaceId} (${i + 1}/${workspaceIds.length})`,
      );

      try {
        await this.workflowHandleStaledRunsWorkspaceService.handleStaledRunsForWorkspace(
          workspaceId,
        );
      } catch (error) {
        this.logger.error(
          `Failed to handle staled runs for workspace ${workspaceId}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }

    this.logger.log('Completed WorkflowHandleStaledRunsCommand command');
  }
}
