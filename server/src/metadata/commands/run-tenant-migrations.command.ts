import { Command, CommandRunner, Option } from 'nest-commander';

import { TenantMigrationService } from 'src/metadata/tenant-migration/tenant-migration.service';

// TODO: implement dry-run
interface RunTenantMigrationsOptions {
  workspaceId: string;
}

@Command({
  name: 'tenant:migrate',
  description: 'Run tenant migrations',
})
export class RunTenantMigrations extends CommandRunner {
  constructor(private readonly tenantMigrationService: TenantMigrationService) {
    super();
  }

  async run(
    passedParam: string[],
    options: RunTenantMigrationsOptions,
  ): Promise<void> {
    console.log('test', passedParam, options);
    this.tenantMigrationService.insertStandardMigrations(options.workspaceId);
  }

  @Option({
    flags: '-w, --workspace-ids <string>',
    description: 'workspace ids',
    required: true,
  })
  parseWorkspaceIds(val: string): string {
    return val;
  }
}
