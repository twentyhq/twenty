import { InjectRepository } from '@nestjs/typeorm';

import { Command, Option } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In, IsNull, Not, Repository } from 'typeorm';

import {
  type MigrationCommandOptions,
  MigrationCommandRunner,
} from 'src/database/commands/command-runners/migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { CleanerWorkspaceService } from 'src/engine/workspace-manager/workspace-cleaner/services/cleaner.workspace-service';

type HardDeleteSoftDeletedSuspendedWorkspacesCommandOptions =
  MigrationCommandOptions & {
    force?: boolean;
  };

@Command({
  name: 'workspace:hard-delete-soft-deleted',
  description: 'Hard delete soft-deleted suspended workspaces',
})
export class HardDeleteSoftDeletedSuspendedWorkspacesCommand extends MigrationCommandRunner {
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
    flags: '--force',
    description:
      'Force hard deletion of soft-deleted workspaces, bypassing the grace period and deletion limit',
    required: false,
  })
  parseForceHardDelete(): boolean {
    return true;
  }

  async fetchSuspendedSoftDeletedWorkspaces({
    workspaceIds,
  }: {
    workspaceIds?: string[];
  }): Promise<WorkspaceEntity[]> {
    return await this.workspaceRepository.find({
      select: ['id'],
      where: {
        activationStatus: In([WorkspaceActivationStatus.SUSPENDED]),
        deletedAt: Not(IsNull()),
        ...(isDefined(workspaceIds) ? { id: In(workspaceIds) } : {}),
      },
      withDeleted: true,
    });
  }

  override async runMigrationCommand(
    _passedParams: string[],
    options: HardDeleteSoftDeletedSuspendedWorkspacesCommandOptions,
  ): Promise<void> {
    const { dryRun, force } = options;

    const softDeletedSuspendedWorkspaces =
      await this.fetchSuspendedSoftDeletedWorkspaces({
        workspaceIds: this.workspaceIds,
      });
    let deletedWorkspaceCounter = 0;

    this.logger.log(
      `${dryRun ? 'DRY RUN - ' : ''}${force ? 'FORCE HARD DELETE - ' : ''}Iterating over ${softDeletedSuspendedWorkspaces.length} soft deleted suspended workspaces`,
    );

    for (const workspace of softDeletedSuspendedWorkspaces) {
      const result =
        await this.cleanerWorkspaceService.hardDeleteSoftDeletedWorkspace({
          workspace,
          dryRun,
          force,
        });

      if (isDefined(result)) {
        deletedWorkspaceCounter++;
      }
    }

    this.logger.log(
      `Destroyed ${deletedWorkspaceCounter}/${softDeletedSuspendedWorkspaces}`,
    );
  }
}
