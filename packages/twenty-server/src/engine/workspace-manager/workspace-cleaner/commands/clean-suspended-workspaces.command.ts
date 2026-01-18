import { InjectRepository } from '@nestjs/typeorm';

import { Command, Option } from 'nest-commander';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In, Repository } from 'typeorm';

import {
  type MigrationCommandOptions,
  MigrationCommandRunner,
} from 'src/database/commands/command-runners/migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  CleanerWorkspaceService,
  type CleanSuspendedWorkspacesOptions,
} from 'src/engine/workspace-manager/workspace-cleaner/services/cleaner.workspace-service';

type CleanSuspendedWorkspacesCommandOptions = MigrationCommandOptions &
  Pick<
    CleanSuspendedWorkspacesOptions,
    'ignoreDestroyGracePeriod' | 'onlyDestroy' | 'onlySoftDelete'
  >;

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

  @Option({
    flags: '--ignore-destroy-grace-period',
    description:
      'Ignore the grace period and hard delete soft-deleted workspaces immediately',
    required: false,
  })
  parseIgnoreDestroyGracePeriod(): boolean {
    return true;
  }

  @Option({
    flags: '--only-destroy',
    description:
      'Only hard delete soft-deleted workspaces, skip soft delete and warning',
    required: false,
  })
  parseOnlyDestroy(): boolean {
    return true;
  }

  @Option({
    flags: '--only-soft-delete',
    description: 'Only soft delete workspaces, skip hard delete and warning',
    required: false,
  })
  parseOnlySoftDelete(): boolean {
    return true;
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
    options: CleanSuspendedWorkspacesCommandOptions,
  ): Promise<void> {
    const { dryRun, ignoreDestroyGracePeriod, onlyDestroy, onlySoftDelete } =
      options;

    const suspendedWorkspaceIds =
      this.workspaceIds.length > 0
        ? this.workspaceIds
        : await this.fetchSuspendedWorkspaceIds();

    this.logger.log(
      `${dryRun ? 'DRY RUN - ' : ''}${ignoreDestroyGracePeriod ? 'IGNORING GRACE PERIOD - ' : ''}${onlyDestroy ? 'ONLY DESTROY - ' : ''}${onlySoftDelete ? 'ONLY SOFT DELETE - ' : ''}Cleaning ${suspendedWorkspaceIds.length} suspended workspaces`,
    );

    await this.cleanerWorkspaceService.batchWarnOrCleanSuspendedWorkspaces({
      workspaceIds: suspendedWorkspaceIds,
      dryRun,
      ignoreDestroyGracePeriod,
      onlyDestroy,
      onlySoftDelete,
    });
  }
}
