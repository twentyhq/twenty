import { Command, CommandRunner, Option } from 'nest-commander';

import { WorkspaceMigrationService } from 'src/metadata/workspace-migration/workspace-migration.service';
import { WorkspaceMigrationRunnerService } from 'src/workspace/workspace-migration-runner/workspace-migration-runner.service';

// TODO: implement dry-run
interface RunWorkspaceMigrationsOptions {
  workspaceId: string;
}

@Command({
  name: 'workspace:migrate',
  description: 'Run workspace migrations',
})
export class RunWorkspaceMigrationsCommand extends CommandRunner {
  constructor(
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
  ) {
    super();
  }

  async run(
    _passedParam: string[],
    options: RunWorkspaceMigrationsOptions,
  ): Promise<void> {
    // TODO: run in a dedicated job + run queries in a transaction.
    await this.workspaceMigrationService.insertStandardMigrations(
      options.workspaceId,
    );
    await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
      options.workspaceId,
    );
  }

  // TODO: workspaceId should be optional and we should run migrations for all workspaces
  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id',
    required: true,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }
}
