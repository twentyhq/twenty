import { Command, CommandRunner, Option } from 'nest-commander';

import { WorkflowRunEnqueueWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-run-enqueue.workspace-service';

type WorkflowRunEnqueueCommandOptions = {
  workspaceIds: string[];
};

@Command({
  name: 'workflow:run:enqueue',
  description: 'Enqueues not started workflow runs',
})
export class WorkflowRunEnqueueCommand extends CommandRunner {
  constructor(
    private readonly workflowRunEnqueueWorkspaceService: WorkflowRunEnqueueWorkspaceService,
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
    options: WorkflowRunEnqueueCommandOptions,
  ): Promise<void> {
    const { workspaceIds } = options;

    await this.workflowRunEnqueueWorkspaceService.enqueueRuns({
      workspaceIds,
    });
  }
}
