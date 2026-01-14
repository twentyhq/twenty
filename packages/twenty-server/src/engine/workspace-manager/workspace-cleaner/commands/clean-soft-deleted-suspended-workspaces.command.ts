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
    ignoreGracePeriod?: boolean;
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
    flags: '--ignore-grace-period',
    description:
      'Ignore the grace period and hard delete soft-deleted workspaces immediately',
    required: false,
  })
  parseIgnoreGracePeriod(): boolean {
    return true;
  }

  async fetchSuspendedSoftDeletedWorkspaces(): Promise<WorkspaceEntity[]> {
    return await this.workspaceRepository.find({
      where: {
        activationStatus: In([WorkspaceActivationStatus.SUSPENDED]),
        deletedAt: Not(IsNull()),
        ...(this.workspaceIds.length > 0 ? { id: In(this.workspaceIds) } : {}),
      },
      withDeleted: true,
    });
  }

  override async runMigrationCommand(
    _passedParams: string[],
    options: HardDeleteSoftDeletedSuspendedWorkspacesCommandOptions,
  ): Promise<void> {
    const { dryRun, ignoreGracePeriod } = options;

    const softDeletedSuspendedWorkspaces =
      await this.fetchSuspendedSoftDeletedWorkspaces();
    let deletedWorkspaceCounter = 0;

    this.logger.log(
      `${dryRun ? 'DRY RUN - ' : ''}${ignoreGracePeriod ? 'IGNORING GRACE PERIOD - ' : ''}Iterating over ${softDeletedSuspendedWorkspaces.length} soft deleted suspended workspaces`,
    );

    for (const workspace of softDeletedSuspendedWorkspaces) {
      const result =
        await this.cleanerWorkspaceService.hardDeleteSoftDeletedWorkspace({
          workspace,
          dryRun,
          ignoreGracePeriod,
        });

      if (isDefined(result)) {
        deletedWorkspaceCounter++;
      }
    }

    this.logger.log(
      `Destroyed ${deletedWorkspaceCounter}/${softDeletedSuspendedWorkspaces.length}`,
    );
  }
}
