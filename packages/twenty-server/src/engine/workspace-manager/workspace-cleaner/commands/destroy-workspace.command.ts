import { InjectRepository } from '@nestjs/typeorm';

import { Command, Option } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  MigrationCommandOptions,
  MigrationCommandRunner,
} from 'src/database/commands/command-runners/migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { CleanerWorkspaceService } from 'src/engine/workspace-manager/workspace-cleaner/services/cleaner.workspace-service';

@Command({
  name: 'workspace:destroy',
  description: 'Destroy workspace',
})
export class DestroyWorkspaceCommand extends MigrationCommandRunner {
  private workspaceIds: string[] = [];

  constructor(
    private readonly cleanerWorkspaceService: CleanerWorkspaceService,
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
  ) {
    super();
  }

  @Option({
    flags: '-w, --workspace-id <workspace_id>',
    description: 'workspace id - mandatory',
    required: true,
  })
  parseWorkspaceId(val: string): string[] {
    this.workspaceIds.push(val);

    return this.workspaceIds;
  }

  override async runMigrationCommand(
    _passedParams: string[],
    options: MigrationCommandOptions,
  ): Promise<void> {
    const { dryRun } = options;

    this.logger.log(
      `${dryRun ? 'DRY RUN - ' : ''}Destroy ${this.workspaceIds.length} workspaces : ${this.workspaceIds.join(', ')}`,
    );

    await this.cleanerWorkspaceService.destroyBillingDeactivatedAndSoftDeletedWorkspaces(
      this.workspaceIds,
      dryRun,
    );
  }
}
