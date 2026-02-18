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
  CLEAN_SUSPENDED_WORKSPACES_OPERATIONS,
  CleanerWorkspaceService,
  CleanSuspendedWorkspacesOperation,
  type CleanSuspendedWorkspacesOptions,
} from 'src/engine/workspace-manager/workspace-cleaner/services/cleaner.workspace-service';

type CleanSuspendedWorkspacesCommandOptions = MigrationCommandOptions &
  Pick<CleanSuspendedWorkspacesOptions, 'ignoreDestroyGracePeriod'> & {
    onlyOperation?: CleanSuspendedWorkspacesOperation;
  };

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
    flags: '--only-operation <operation>',
    description:
      'Run only a specific operation: warn, destroy (hard delete), or soft-delete',
    required: false,
    choices: [...CLEAN_SUSPENDED_WORKSPACES_OPERATIONS],
  })
  parseOnlyOperation(val: string): CleanSuspendedWorkspacesOperation {
    return val as CleanSuspendedWorkspacesOperation;
  }

  async fetchSuspendedWorkspaceIds(): Promise<string[]> {
    const suspendedWorkspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: In([WorkspaceActivationStatus.SUSPENDED]),
        ...(this.workspaceIds.length > 0 ? { id: In(this.workspaceIds) } : {}),
      },
      withDeleted: true,
    });

    return suspendedWorkspaces.map((workspace) => workspace.id);
  }

  override async runMigrationCommand(
    _passedParams: string[],
    options: CleanSuspendedWorkspacesCommandOptions,
  ): Promise<void> {
    const { dryRun, ignoreDestroyGracePeriod, onlyOperation } = options;

    const suspendedWorkspaceIds = await this.fetchSuspendedWorkspaceIds();

    const operationLabel = onlyOperation
      ? `ONLY ${onlyOperation.toUpperCase()} - `
      : '';

    this.logger.log(
      `${dryRun ? 'DRY RUN - ' : ''}${ignoreDestroyGracePeriod ? 'IGNORING GRACE PERIOD - ' : ''}${operationLabel}Cleaning ${suspendedWorkspaceIds.length} suspended workspaces`,
    );

    await this.cleanerWorkspaceService.batchWarnOrCleanSuspendedWorkspaces({
      workspaceIds: suspendedWorkspaceIds,
      dryRun,
      ignoreDestroyGracePeriod,
      onlyOperation,
    });
  }
}
