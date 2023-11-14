import { Command, CommandRunner, Option } from 'nest-commander';

import { TenantMigrationService } from 'src/metadata/tenant-migration/tenant-migration.service';
import { TenantMigrationRunnerService } from 'src/tenant-migration-runner/tenant-migration-runner.service';

// TODO: implement dry-run
interface RunTenantMigrationsOptions {
  workspaceId: string;
}

@Command({
  name: 'tenant:migrate',
  description: 'Run tenant migrations',
})
export class RunTenantMigrationsCommand extends CommandRunner {
  constructor(
    private readonly tenantMigrationService: TenantMigrationService,
    private readonly tenantMigrationRunnerService: TenantMigrationRunnerService,
  ) {
    super();
  }

  async run(
    _passedParam: string[],
    options: RunTenantMigrationsOptions,
  ): Promise<void> {
    // TODO: run in a dedicated job + run queries in a transaction.
    await this.tenantMigrationService.insertStandardMigrations(
      options.workspaceId,
    );
    await this.tenantMigrationRunnerService.executeMigrationFromPendingMigrations(
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
