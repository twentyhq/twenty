import { Command, CommandRunner, Option } from 'nest-commander';

import { CleanWorkspaceService } from 'src/engine/workspace-manager/workspace-cleaner/services/clean.workspace-service';

type CleanSuspendedWorkspacesCommandOptions = {
  workspaceIds: string[];
};

@Command({
  name: 'workspaces:clean',
  description: 'Clean suspended workspaces',
})
export class CleanSuspendedWorkspacesCommand extends CommandRunner {
  constructor(private readonly cleanWorkspaceService: CleanWorkspaceService) {
    super();
  }

  @Option({
    flags: '-w, --workspace-ids [workspaceIds]',
    description: 'comma separated workspace ids',
    required: true,
  })
  parseWorkspaceIds(value: string): string[] {
    return value.split(',');
  }

  async run(
    _passedParam: string[],
    options: CleanSuspendedWorkspacesCommandOptions,
  ): Promise<void> {
    await this.cleanWorkspaceService.batchWarnOrCleanWorkspaces(
      options.workspaceIds,
    );
  }
}
