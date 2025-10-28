import { InjectRepository } from '@nestjs/typeorm';

import { Command, Option } from 'nest-commander';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In, Repository } from 'typeorm';

import {
  type MigrationCommandOptions,
  MigrationCommandRunner,
} from 'src/database/commands/command-runners/migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { CleanerWorkspaceService } from 'src/engine/workspace-manager/workspace-cleaner/services/cleaner.workspace-service';

@Command({
  name: 'workspace:clean',
  description: 'Clean suspended workspace',
})
export class CleanSuspendedWorkspacesCommand extends MigrationCommandRunner {
  private workspaceIds: string[] = [];

  constructor(
    private readonly cleanerWorkspaceService: CleanerWorkspaceService,
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {
    super();
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description:
      'workspace id. Command runs on all suspended workspaces if not provided',
    required: false,
  })
  parseWorkspaceId(val: string): string[] {
    this.workspaceIds.push(val);

    return this.workspaceIds;
  }

  async fetchSuspendedWorkspaceIds(): Promise<string[]> {
    const suspendedWorkspaces = await this.workspaceRepository.find({
      select: ['id'],
      where: {
        activationStatus: In([WorkspaceActivationStatus.SUSPENDED]),
      },
      withDeleted: true,
    });

    return suspendedWorkspaces.map((workspace) => workspace.id);
  }

  override async runMigrationCommand(
    _passedParams: string[],
    options: MigrationCommandOptions,
  ): Promise<void> {
    const { dryRun } = options;

    const suspendedWorkspaceIds =
      this.workspaceIds.length > 0
        ? this.workspaceIds
        : await this.fetchSuspendedWorkspaceIds();

    this.logger.log(
      `${dryRun ? 'DRY RUN - ' : ''}Cleaning ${suspendedWorkspaceIds.length} suspended workspaces`,
    );

    await this.cleanerWorkspaceService.batchWarnOrCleanSuspendedWorkspaces(
      suspendedWorkspaceIds,
      dryRun,
    );
  }
}
