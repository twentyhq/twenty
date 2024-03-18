import { Command, CommandRunner, Option } from 'nest-commander';

import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';

interface ExecuteWorkspaceMigrationsOptions {
  workspaceId: string;
}

@Command({
  name: 'workspace:apply-pending-migrations',
  description: 'Apply pending migrations',
})
export class WorkspaceExecutePendingMigrationsCommand extends CommandRunner {
  constructor(
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
  ) {
    super();
  }

  async run(
    _passedParam: string[],
    options: ExecuteWorkspaceMigrationsOptions,
  ): Promise<void> {
    await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
      options.workspaceId,
    );
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
