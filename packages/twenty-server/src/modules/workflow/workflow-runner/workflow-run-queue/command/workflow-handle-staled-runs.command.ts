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

    await this.workflowHandleStaledRunsWorkspaceService.handleStaledRuns({
      workspaceIds,
    });
  }
}
