import { Command, CommandRunner, Option } from 'nest-commander';

import { WorkspaceHealthService } from 'src/workspace/workspace-health/workspace-health.service';

interface WorkspaceHealthCommandOptions {
  workspaceId: string;
}

@Command({
  name: 'workspace:health',
  description: 'Check health of the given workspace.',
})
export class WorkspaceHealthCommand extends CommandRunner {
  constructor(private readonly workspaceHealthService: WorkspaceHealthService) {
    super();
  }

  async run(
    _passedParam: string[],
    options: WorkspaceHealthCommandOptions,
  ): Promise<void> {
    await this.workspaceHealthService.healthCheck(options.workspaceId);
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id',
    required: true,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }
}
